import { Router } from "express";
import { pool } from "../../../config/db";
import { authenticateToken } from "../../../middleware/authenticateToken";

const GlobalNotfsRouter = Router();

GlobalNotfsRouter.post('/send-notfs', async (req,res)=>{
    const { title, message } = req.body;
    try{
        await pool.query(`BEGIN`);

        const result = await pool.query(
            `
                INSERT INTO Notifications (title, message, is_global, created_at)
                VALUES ($1, $2, TRUE, NOW())
                RETURNING *
            `, [title, message]
        );

        const notfs = result.rows[0];

        await pool.query(`
            DELETE FROM Notifications 
            WHERE id NOT IN (
                SELECT id FROM Notifications
                WHERE is_global = TRUE 
                ORDER BY created_at DESC
                LIMIT 5
            )
        `);

        const io = req.app.get("io");

        if(io){
            io.emit("new_global_notification", notfs)
        }

        await pool.query("COMMIT"); 

        res.status(201).json({
            message: 'Global notification published successfully',
        });
    } catch (error){
        await pool.query("ROLLBACK"); 
        console.error("Error at /send-notfs: ", error);
    }
});

GlobalNotfsRouter.get('/get-notfs', authenticateToken, async (req,res)=>{
    const user = (req as any).user;

    try {
        const result = await pool.query(
            `SELECT n.id, n.title, n.message, n.created_at, n.is_global, n.user_id
            FROM Notifications n
            LEFT JOIN NotificationReadStatus nr ON nr.notification_id = n.id AND nr.user_id = $1
            WHERE n.is_global = TRUE AND nr.notification_id IS NULL AND n.user_id IS NULL
            ORDER BY n.created_at
            `, [user.id]
        );

        res.status(200).json(result.rows);
    } catch (error){
        console.error("Error at /get-notfs: ", error);
    }
});
GlobalNotfsRouter.get('/get-personal-notfs', authenticateToken, async (req, res) => {
    const user = (req as any).user;

    try {
        const result = await pool.query(
            `SELECT n.id, n.title, n.message, n.created_at, n.is_global, n.user_id
            FROM Notifications n
            LEFT JOIN NotificationReadStatus nr ON nr.notification_id = n.id AND nr.user_id = $1
            WHERE n.is_global = FALSE AND nr.notification_id IS NULL AND n.user_id = $1
            ORDER BY n.created_at DESC
            `, [user.id]
        );

        res.status(200).json(result.rows);
    } catch (error){
        console.error("Error at /get-personal-notfs: ", error);
        res.status(500).json({ message: 'Error fetching personal notifications' });
    }
});

GlobalNotfsRouter.post('/mark-as-read', authenticateToken, async (req,res)=>{
    const user = (req as any).user;
    const { notfsID } = req.body;
    console.log("/mark-as-read data: ", user, " id ", notfsID);

    try{

        const result = await pool.query(`
            INSERT INTO NotificationReadStatus (user_id, notification_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, notification_id) 
            DO UPDATE SET read_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [user.id, notfsID]);

        res.status(200).json({
            message: 'Notification marked as read',
            notification: result.rows[0]
        });
    } catch (error){
        console.error("Error at /mark-as-read: ", error);
    }
});

export default GlobalNotfsRouter;
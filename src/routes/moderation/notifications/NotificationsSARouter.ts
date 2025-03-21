import { Router } from "express";
import { pool } from "../../../config/db";
import { authenticateSAToken } from "../../../middleware/authenticateToken";

const NotificationsSARouter = Router();

NotificationsSARouter.get('/get-all-notfs', authenticateSAToken, async (req,res)=>{
    try {
        const result = await pool.query(`
            SELECT id, title, created_at FROM Notifications
        `);

        res.json({message:"All notfs", notfs:result.rows});

    } catch (error){
        console.error("Error at get-all-notfs: ", error);
        res.status(400).json({message:"error at get all notfs"})
    }
});

NotificationsSARouter.delete('/delete-notf',authenticateSAToken, async (req,res)=>{
    const { id } = req.body;

    try {
        await pool.query(`BEGIN`);

        await pool.query(`DELETE FROM NotificationReadStatus WHERE notification_id=$1`, [id]);
        await pool.query(`DELETE FROM Notifications WHERE id = $1`, [id]);

        await pool.query(`COMMIT`);

        res.status(200).json({ message: "notf deleted successfully" });
    } catch (error){
        await pool.query(`ROLLBACK`);
        console.error("Error at delete-notf: ", error);
        res.status(400).json({message:"error at delete notf"})
    }
});

export default NotificationsSARouter;
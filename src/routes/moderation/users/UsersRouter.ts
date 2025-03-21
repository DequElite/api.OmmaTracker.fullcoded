import { Router } from "express";
import { pool } from "../../../config/db";
import { authenticateSAToken } from "../../../middleware/authenticateToken";

const UsersRouter = Router();

UsersRouter.get('/get-all-users',authenticateSAToken, async (req,res)=>{
    try {
        const result = await pool.query(`
            SELECT id, username, email FROM Users
        `);

        res.json({message:"All users", users:result.rows})

    } catch (error){
        console.error("Error at get-all-users: ", error);
        res.status(400).json({message:"error at get all users"})
    }
});

UsersRouter.delete('/delete-user',authenticateSAToken, async (req,res)=>{
    const { id } = req.body;

    try {
        await pool.query(`BEGIN`);

        await pool.query(`DELETE FROM UsersSubtasks WHERE task_id IN (SELECT id FROM UsersTasks WHERE user_id = $1)`, [id]);
        await pool.query(`DELETE FROM UsersTasks WHERE user_id = $1`, [id]);
        await pool.query(`DELETE FROM UsersAdditional WHERE user_id = $1`, [id]);

        await pool.query(`DELETE FROM Users WHERE id = $1`, [id]);

        await pool.query(`COMMIT`);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error){
        await pool.query(`ROLLBACK`);
        console.error("Error at delete-user: ", error);
        res.status(400).json({message:"error at delete user"})
    }
});

export default UsersRouter;
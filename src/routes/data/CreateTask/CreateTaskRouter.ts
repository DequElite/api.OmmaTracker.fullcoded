import { Router } from "express";
import { authenticateToken } from "../../../middleware/authenticateToken";
import { pool } from "../../../config/db";

const CreateTaskRouter = Router();

CreateTaskRouter.post('/create', authenticateToken, async (req,res)=>{
    const user = (req as any).user;
    const { TaskData } = req.body;
    const { SubTasksList } = req.body;
    console.log(req.body);
    
    try {
        await pool.query(`BEGIN`);
    
        const taskResult = await pool.query(`
            INSERT INTO UsersTasks (user_id, difficulty_level, name, description, date_to_complete, subtasksnumber, completedsubtasks)
            VALUES ($1, $2, $3, $4, $5, $6, 0) 
            RETURNING id
        `, [user.id, TaskData.difficulty_level, TaskData.name, TaskData.description, TaskData.date_to_complete, SubTasksList.length]);
    
        if (taskResult.rows.length === 0) {
            throw new Error("Task insertion failed, no ID returned.");
        }
    
        const taskId = taskResult.rows[0].id;
        console.log("Created Task ID:", taskId);
    
        for (const subtask of SubTasksList) {
            await pool.query(`
                INSERT INTO UsersSubtasks (task_id, text, is_completed)
                VALUES ($1, $2, FALSE)
            `, [taskId, subtask.text]);
        }

        await pool.query(`COMMIT`);
    
        res.status(200).json({ message: "Task created successfully" });
    } catch (error) {
        await pool.query(`ROLLBACK`);
        console.error("Error CreateTaskRouter: ", error);
        res.status(500).json({ message: "Failed to create task" });
    }
    
})

export default CreateTaskRouter;
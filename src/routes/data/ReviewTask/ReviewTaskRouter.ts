import { Router, Request, Response } from "express";
import { authenticateToken } from "../../../middleware/authenticateToken";
import { pool } from "../../../config/db";
import { userSockets } from "../../..";

const ReviewTaskRouter = Router();

const SendNotificationAboutExpired = async (task:any, req:Request, user:any) => {
    try {

        if (task.notification_sent) {
            return;
        }

        const result = await pool.query(
            `
                INSERT INTO Notifications (title, message, is_global, created_at, user_id)
                VALUES ($1, $2, FALSE, NOW(), $3)
                RETURNING *
            `, [`The task ${task.name} will expire soon!`, `Your task will expire soon! Complete it quickly!`, user.id]
        );

        const notfs = result.rows[0];

        const io = req.app.get("io");

        const socketId = userSockets.get(user.id);
        console.log("userSockets map:", userSockets); // Лог для проверки наличия сокета
        if (socketId) {
            console.log(`Notification will be sent to socket ID: ${socketId}`);
            io.to(socketId).emit("new_personal_notification", notfs);
        } else {
            console.log(`Socket ID not found for user ${user.id}, user may be offline.`);
        }

        await pool.query(`
            UPDATE UsersTasks 
            SET notification_sent = TRUE
            WHERE id = $1
        `, [task.id]);

    } catch (error) {
        console.error("Error at SendNotificationAboutExpired: ", error);
    }
}

ReviewTaskRouter.post('/all-tasks', authenticateToken, async (req:Request,res:Response)=>{
    const user = (req as any).user;
    try{
        const result = await pool.query(`
            SELECT * FROM UsersTasks 
            WHERE user_id = $1
        `, [user.id])

        if(result.rows.length === 0) {
            res.status(200).json({message:"user don`t have any tasks", usertasks:[]})
            return;
        }

        result.rows.map((task)=>{
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const taskDate = new Date(task.date_to_complete);

            if (taskDate.toDateString() === tomorrow.toDateString()) {
                SendNotificationAboutExpired(task, req, user);
            }
        });

        res.status(200).json({message:"All user`s tasks are found", usertasks:result.rows});
    } catch (error){
        console.error("error at get all tasks: ", error);
        res.status(500).json({message:"error at get all tasks"})
    }
})

ReviewTaskRouter.post('/once-task', authenticateToken, async (req,res)=>{
    const user = (req as any).user;
    const {taskid} = req.body;

    try{
        const TaskResult = await pool.query(`
            SELECT * FROM UsersTasks 
            WHERE id = $1
        `, [taskid]);

        if (TaskResult.rows.length === 0) {
            res.status(404).json({ message: "Task not found" });
            return;
        }

        const task = TaskResult.rows[0];

        if(task.user_id !== user.id){
            res.status(403).json({ error: "User does not own this task" });
            return;
        }

        const SubTasksResult = await pool.query(`
            SELECT * FROM UsersSubtasks 
            WHERE task_id = $1
        `, [taskid]);

        res.status(200).json({
            message: "Subtasks and task retrieved successfully",
            Task: task,
            SubTasks: SubTasksResult.rows
        });

        // let SubTasksResult;

        // if(TaskResult.rows[0].user_id === user.id){
        //     SubTasksResult = await pool.query(`
        //         SELECT * FROM UsersSubtasks 
        //         WHERE task_id = $1
        //     `, [taskid]);
        //     res.status(200).json({
        //         message:'Sub tasks and task got successfully',
        //         Task: TaskResult.rows[0],
        //         SubTasks: SubTasksResult.rows
        //     })
        // } else {
        //     throw new Error ("USER_DONOT_RESPOND")
        // }

    } catch (error){
        console.error("error at get once tasks: ", error);
        res.status(400).json({message:"error at get once tasks"})
    }
})

ReviewTaskRouter.put('/update-subtasks', authenticateToken, async (req,res)=> {
    const user = (req as any).user;
    const {taskid, subtasks, completed_length} = req.body;

    try{
        await pool.query(`BEGIN`);

        const TaskResult = await pool.query(`
            SELECT * FROM UsersTasks 
            WHERE id = $1
        `, [taskid]);

        if (TaskResult.rows.length === 0) {
            res.status(404).json({ message: "Task not found" });
            return;
        }

        const task = TaskResult.rows[0];

        if(task.user_id !== user.id){
            res.status(403).json({ error: "User does not own this task" });
            return;
        }

        await pool.query(`
            UPDATE UsersTasks 
            SET completedsubtasks = $1
            WHERE id = $2
        `, [completed_length, task.id])

        for(const subtask of subtasks){
            await pool.query(`
                UPDATE UsersSubtasks
                SET is_completed = $1
                WHERE id = $2 AND task_id = $3
            `, [subtask.is_completed, subtask.id, taskid]);
        }

        await pool.query(`COMMIT`);

        res.status(200).json({ message: "Subtasks updated successfully" });

    } catch (error){
        await pool.query(`ROLLBACK`);
        console.error("error at get once tasks: ", error);
        res.status(400).json({message:"error at get once tasks"})
    }
})

ReviewTaskRouter.delete('/delete-task', authenticateToken, async (req,res)=> {
    const user = (req as any).user;
    const {taskid} = req.body;

    try{
        await pool.query(`BEGIN`);

        const TaskResult = await pool.query(`
            SELECT * FROM UsersTasks 
            WHERE id = $1
        `, [taskid]);

        if (TaskResult.rows.length === 0) {
            res.status(404).json({ message: "Task not found" });
            return;
        }

        const task = TaskResult.rows[0];

        if(task.user_id !== user.id){
            res.status(403).json({ error: "User does not own this task" });
            return;
        }

        await pool.query(`
            DELETE FROM UsersSubtasks 
            WHERE task_id = $1
        `, [task.id]);

        await pool.query(`
            DELETE FROM UsersTasks 
            WHERE id = $1
        `, [task.id]);

        await pool.query(`COMMIT`);

        res.status(200).json({ message: "task deleted successfully" });

    } catch (error){
        await pool.query(`ROLLBACK`);
        console.error("error at get deleted tasks: ", error);
        res.status(400).json({message:"error at get deleted tasks"})
    }
})


export default ReviewTaskRouter;
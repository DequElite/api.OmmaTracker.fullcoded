import { Router } from "express";
import { authenticateToken } from "../../../middleware/authenticateToken";
import { pool } from "../../../config/db";

const ReviewTaskRouter = Router();

ReviewTaskRouter.post('/all-tasks', authenticateToken, async (req,res)=>{
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
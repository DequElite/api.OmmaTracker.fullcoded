"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../../../middleware/authenticateToken");
const db_1 = require("../../../config/db");
const __1 = require("../../..");
const ReviewTaskRouter = (0, express_1.Router)();
const SendNotificationAboutExpired = (task, req, user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (task.notification_sent) {
            return;
        }
        const result = yield db_1.pool.query(`
                INSERT INTO Notifications (title, message, is_global, created_at, user_id)
                VALUES ($1, $2, FALSE, NOW(), $3)
                RETURNING *
            `, [`The task ${task.name} will expire soon!`, `Your task will expire soon! Complete it quickly!`, user.id]);
        const notfs = result.rows[0];
        const io = req.app.get("io");
        const socketId = __1.userSockets.get(user.id);
        console.log("userSockets map:", __1.userSockets); // Лог для проверки наличия сокета
        if (socketId) {
            console.log(`Notification will be sent to socket ID: ${socketId}`);
            io.to(socketId).emit("new_personal_notification", notfs);
        }
        else {
            console.log(`Socket ID not found for user ${user.id}, user may be offline.`);
        }
        yield db_1.pool.query(`
            UPDATE UsersTasks 
            SET notification_sent = TRUE
            WHERE id = $1
        `, [task.id]);
    }
    catch (error) {
        console.error("Error at SendNotificationAboutExpired: ", error);
    }
});
ReviewTaskRouter.post('/all-tasks', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const result = yield db_1.pool.query(`
            SELECT * FROM UsersTasks 
            WHERE user_id = $1
        `, [user.id]);
        if (result.rows.length === 0) {
            res.status(200).json({ message: "user don`t have any tasks", usertasks: [] });
            return;
        }
        result.rows.map((task) => {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const taskDate = new Date(task.date_to_complete);
            if (taskDate.toDateString() === tomorrow.toDateString()) {
                SendNotificationAboutExpired(task, req, user);
            }
        });
        res.status(200).json({ message: "All user`s tasks are found", usertasks: result.rows });
    }
    catch (error) {
        console.error("error at get all tasks: ", error);
        res.status(500).json({ message: "error at get all tasks" });
    }
}));
ReviewTaskRouter.post('/once-task', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { taskid } = req.body;
    try {
        const TaskResult = yield db_1.pool.query(`
            SELECT * FROM UsersTasks 
            WHERE id = $1
        `, [taskid]);
        if (TaskResult.rows.length === 0) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        const task = TaskResult.rows[0];
        if (task.user_id !== user.id) {
            res.status(403).json({ error: "User does not own this task" });
            return;
        }
        const SubTasksResult = yield db_1.pool.query(`
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
    }
    catch (error) {
        console.error("error at get once tasks: ", error);
        res.status(400).json({ message: "error at get once tasks" });
    }
}));
ReviewTaskRouter.put('/update-subtasks', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { taskid, subtasks, completed_length } = req.body;
    try {
        yield db_1.pool.query(`BEGIN`);
        const TaskResult = yield db_1.pool.query(`
            SELECT * FROM UsersTasks 
            WHERE id = $1
        `, [taskid]);
        if (TaskResult.rows.length === 0) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        const task = TaskResult.rows[0];
        if (task.user_id !== user.id) {
            res.status(403).json({ error: "User does not own this task" });
            return;
        }
        yield db_1.pool.query(`
            UPDATE UsersTasks 
            SET completedsubtasks = $1
            WHERE id = $2
        `, [completed_length, task.id]);
        for (const subtask of subtasks) {
            yield db_1.pool.query(`
                UPDATE UsersSubtasks
                SET is_completed = $1
                WHERE id = $2 AND task_id = $3
            `, [subtask.is_completed, subtask.id, taskid]);
        }
        yield db_1.pool.query(`COMMIT`);
        res.status(200).json({ message: "Subtasks updated successfully" });
    }
    catch (error) {
        yield db_1.pool.query(`ROLLBACK`);
        console.error("error at get once tasks: ", error);
        res.status(400).json({ message: "error at get once tasks" });
    }
}));
ReviewTaskRouter.delete('/delete-task', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { taskid } = req.body;
    try {
        yield db_1.pool.query(`BEGIN`);
        const TaskResult = yield db_1.pool.query(`
            SELECT * FROM UsersTasks 
            WHERE id = $1
        `, [taskid]);
        if (TaskResult.rows.length === 0) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        const task = TaskResult.rows[0];
        if (task.user_id !== user.id) {
            res.status(403).json({ error: "User does not own this task" });
            return;
        }
        yield db_1.pool.query(`
            DELETE FROM UsersSubtasks 
            WHERE task_id = $1
        `, [task.id]);
        yield db_1.pool.query(`
            DELETE FROM UsersTasks 
            WHERE id = $1
        `, [task.id]);
        yield db_1.pool.query(`COMMIT`);
        res.status(200).json({ message: "task deleted successfully" });
    }
    catch (error) {
        yield db_1.pool.query(`ROLLBACK`);
        console.error("error at get deleted tasks: ", error);
        res.status(400).json({ message: "error at get deleted tasks" });
    }
}));
exports.default = ReviewTaskRouter;

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
const CreateTaskRouter = (0, express_1.Router)();
CreateTaskRouter.post('/create', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { TaskData } = req.body;
    const { SubTasksList } = req.body;
    console.log(req.body);
    try {
        yield db_1.pool.query(`BEGIN`);
        const taskResult = yield db_1.pool.query(`
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
            yield db_1.pool.query(`
                INSERT INTO UsersSubtasks (task_id, text, is_completed)
                VALUES ($1, $2, FALSE)
            `, [taskId, subtask.text]);
        }
        yield db_1.pool.query(`COMMIT`);
        res.status(200).json({ message: "Task created successfully" });
    }
    catch (error) {
        yield db_1.pool.query(`ROLLBACK`);
        console.error("Error CreateTaskRouter: ", error);
        res.status(500).json({ message: "Failed to create task" });
    }
}));
exports.default = CreateTaskRouter;

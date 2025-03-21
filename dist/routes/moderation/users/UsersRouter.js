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
const db_1 = require("../../../config/db");
const authenticateToken_1 = require("../../../middleware/authenticateToken");
const UsersRouter = (0, express_1.Router)();
UsersRouter.get('/get-all-users', authenticateToken_1.authenticateSAToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query(`
            SELECT id, username, email FROM Users
        `);
        res.json({ message: "All users", users: result.rows });
    }
    catch (error) {
        console.error("Error at get-all-users: ", error);
        res.status(400).json({ message: "error at get all users" });
    }
}));
UsersRouter.delete('/delete-user', authenticateToken_1.authenticateSAToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        yield db_1.pool.query(`BEGIN`);
        yield db_1.pool.query(`DELETE FROM UsersSubtasks WHERE task_id IN (SELECT id FROM UsersTasks WHERE user_id = $1)`, [id]);
        yield db_1.pool.query(`DELETE FROM UsersTasks WHERE user_id = $1`, [id]);
        yield db_1.pool.query(`DELETE FROM UsersAdditional WHERE user_id = $1`, [id]);
        yield db_1.pool.query(`DELETE FROM Users WHERE id = $1`, [id]);
        yield db_1.pool.query(`COMMIT`);
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        yield db_1.pool.query(`ROLLBACK`);
        console.error("Error at delete-user: ", error);
        res.status(400).json({ message: "error at delete user" });
    }
}));
exports.default = UsersRouter;

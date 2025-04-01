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
const NotificationsSARouter = (0, express_1.Router)();
NotificationsSARouter.get('/get-all-notfs', authenticateToken_1.authenticateSAToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query(`
            SELECT id, title, created_at FROM Notifications
        `);
        res.json({ message: "All notfs", notfs: result.rows });
    }
    catch (error) {
        console.error("Error at get-all-notfs: ", error);
        res.status(400).json({ message: "error at get all notfs" });
    }
}));
NotificationsSARouter.delete('/delete-notf', authenticateToken_1.authenticateSAToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        yield db_1.pool.query(`BEGIN`);
        yield db_1.pool.query(`DELETE FROM NotificationReadStatus WHERE notification_id=$1`, [id]);
        yield db_1.pool.query(`DELETE FROM Notifications WHERE id = $1`, [id]);
        yield db_1.pool.query(`COMMIT`);
        res.status(200).json({ message: "notf deleted successfully" });
    }
    catch (error) {
        yield db_1.pool.query(`ROLLBACK`);
        console.error("Error at delete-notf: ", error);
        res.status(400).json({ message: "error at delete notf" });
    }
}));
exports.default = NotificationsSARouter;

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
const GlobalNotfsRouter = (0, express_1.Router)();
GlobalNotfsRouter.post('/send-notfs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, message } = req.body;
    try {
        yield db_1.pool.query(`BEGIN`);
        const result = yield db_1.pool.query(`
                INSERT INTO Notifications (title, message, is_global, created_at)
                VALUES ($1, $2, TRUE, NOW())
                RETURNING *
            `, [title, message]);
        const notfs = result.rows[0];
        yield db_1.pool.query(`
            DELETE FROM Notifications 
            WHERE id NOT IN (
                SELECT id FROM Notifications
                WHERE is_global = TRUE 
                ORDER BY created_at DESC
                LIMIT 5
            )
        `);
        const io = req.app.get("io");
        if (io) {
            io.emit("new_global_notification", notfs);
        }
        yield db_1.pool.query("COMMIT");
        res.status(201).json({
            message: 'Global notification published successfully',
        });
    }
    catch (error) {
        yield db_1.pool.query("ROLLBACK");
        console.error("Error at /send-notfs: ", error);
    }
}));
GlobalNotfsRouter.get('/get-notfs', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const result = yield db_1.pool.query(`SELECT n.id, n.title, n.message, n.created_at, n.is_global, n.user_id
            FROM Notifications n
            LEFT JOIN NotificationReadStatus nr ON nr.notification_id = n.id AND nr.user_id = $1
            WHERE n.is_global = TRUE AND nr.notification_id IS NULL AND n.user_id IS NULL
            ORDER BY n.created_at
            `, [user.id]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error("Error at /get-notfs: ", error);
    }
}));
GlobalNotfsRouter.get('/get-personal-notfs', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const result = yield db_1.pool.query(`SELECT n.id, n.title, n.message, n.created_at, n.is_global, n.user_id
            FROM Notifications n
            LEFT JOIN NotificationReadStatus nr ON nr.notification_id = n.id AND nr.user_id = $1
            WHERE n.is_global = FALSE AND nr.notification_id IS NULL AND n.user_id = $1
            ORDER BY n.created_at DESC
            `, [user.id]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error("Error at /get-personal-notfs: ", error);
        res.status(500).json({ message: 'Error fetching personal notifications' });
    }
}));
GlobalNotfsRouter.post('/mark-as-read', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { notfsID } = req.body;
    console.log("/mark-as-read data: ", user, " id ", notfsID);
    try {
        const result = yield db_1.pool.query(`
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
    }
    catch (error) {
        console.error("Error at /mark-as-read: ", error);
    }
}));
exports.default = GlobalNotfsRouter;

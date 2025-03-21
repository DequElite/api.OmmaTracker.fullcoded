"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InitRoutes;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const RegisterRouter_1 = __importDefault(require("./register/RegisterRouter"));
const AuthRouter_1 = __importDefault(require("./auth/AuthRouter"));
const DataRouter_1 = __importDefault(require("./data/DataRouter"));
const colorConsole_1 = __importDefault(require("../utils/colorConsole"));
const ModerationRouter_1 = __importDefault(require("./moderation/ModerationRouter"));
const NotificationsRouter_1 = __importDefault(require("./notifications/NotificationsRouter"));
const API_DIR = "/api";
const cors = require('cors');
require("dotenv").config();
function InitRoutes(app) {
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use(cors({
        origin: process.env.APP_MODE === "DEV" ? process.env.FORNT_END_URI_DEV : process.env.FORNT_END_URI_PROD,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'admin-authorization'],
        credentials: true,
    }));
    app.get('/api/check-is-server-avaible', (req, res) => {
        console.log((0, colorConsole_1.default)("Sevrver is avaible", 'magenta', 'blue', 'bold'));
        res.status(200).json({ message: "Server is available" });
    });
    app.use(`${API_DIR}/register`, RegisterRouter_1.default);
    app.use(`${API_DIR}/auth`, AuthRouter_1.default);
    app.use(`${API_DIR}/data`, DataRouter_1.default);
    app.use(`${API_DIR}/moderation`, ModerationRouter_1.default);
    app.use(`${API_DIR}/notifications`, NotificationsRouter_1.default);
}

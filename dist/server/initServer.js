"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InitServer;
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("../routes/router"));
const endPointsList_1 = __importDefault(require("../utils/endPointsList"));
const db_1 = __importDefault(require("../config/db"));
const createTable_1 = require("../config/createTable");
const colorConsole_1 = __importDefault(require("../utils/colorConsole"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    path: '/custom/socket.io',
    cors: {
        origin: process.env.APP_MODE === "DEV" ? process.env.FORNT_END_URI_DEV : process.env.FORNT_END_URI_PROD,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'admin-authorization'],
        credentials: true,
    },
});
app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
});
function InitServer() {
    (0, db_1.default)();
    (0, createTable_1.createUsersTable)();
    // clearUsersTables()
    (0, router_1.default)(app);
    const PORT = process.env.PORT || 7003;
    io.on('connection', (socket) => {
        console.log('User connected with socket id:', socket.id);
        socket.on("disconnect", () => {
            console.log((0, colorConsole_1.default)("A user disconnected", "red", "black", "bold"));
        });
        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });
        socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    });
    server.listen(PORT, () => {
        console.log((0, colorConsole_1.default)(`Server was started on port ${PORT}`, 'green', 'black', 'bold'));
        setTimeout(() => {
            (0, endPointsList_1.default)(app);
        }, 2000);
    });
    app.set("io", io);
}

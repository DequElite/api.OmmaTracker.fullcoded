"use strict";
// import InitServer from "./server/initServer";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSockets = exports.app = void 0;
// InitServer();
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("./routes/router"));
const endPointsList_1 = __importDefault(require("./utils/endPointsList"));
const db_1 = __importDefault(require("./config/db"));
const createTable_1 = require("./config/createTable");
const colorConsole_1 = __importDefault(require("./utils/colorConsole"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.app = (0, express_1.default)();
const server = http_1.default.createServer(exports.app);
const io = new socket_io_1.Server(server, {
    path: '/custom/socket.io',
    cors: {
        origin: process.env.APP_MODE === "DEV" ? process.env.FORNT_END_URI_DEV : process.env.FORNT_END_URI_PROD,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'admin-authorization'],
        credentials: true,
    },
});
(0, db_1.default)();
(0, createTable_1.createUsersTable)();
// clearUsersTables()
(0, router_1.default)(exports.app);
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const PORT = process.env.PORT || 7003;
// io.on('connection', (socket) => {
//         console.log('User connected with socket id:', socket.id);
//         socket.on("disconnect", () => {
//             console.log(colorize("A user disconnected", "red", "black", "bold"));
//         });
//         socket.on('connect_error', (err) => {
//             console.error('Connection error:', err);
//         });
//         socket.on('error', (err) => {
//             console.error('Socket error:', err);
//         });
//     });
exports.userSockets = new Map();
io.on("connection", (socket) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        console.log("No token provided, disconecting...");
        return socket.disconnect();
    }
    try {
        const decodedUser = jsonwebtoken_1.default.verify(token, JWT_SECRET_KEY || "");
        const userId = decodedUser.id;
        socket.data.userId = userId;
        exports.userSockets.set(userId, socket.id);
        console.log(`User connected: userId=${userId}, socketId=${socket.id}`);
        socket.emit("socket_id", socket.id);
        socket.on('new_global_notification', (notification) => {
            console.log("Sended notf: ", notification);
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: userId=${userId}`);
            exports.userSockets.delete(userId);
        });
    }
    catch (error) {
        console.error("Invalid ty: error: ", error);
        socket.disconnect();
    }
});
server.listen(PORT, () => {
    console.log((0, colorConsole_1.default)(`Server was started on port ${PORT}`, 'green', 'black', 'bold'));
    setTimeout(() => {
        (0, endPointsList_1.default)(exports.app);
    }, 2000);
});
exports.app.set("io", io);

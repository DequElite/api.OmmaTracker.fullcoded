// import InitServer from "./server/initServer";

// InitServer();

import express, { Express } from "express";
import InitRoutes from "./routes/router";
import ReturnEndPoints from "./utils/endPointsList";
import ConfigDB from "./config/db";
import { clearUsersTables, createUsersTable } from "./config/createTable";
import colorize from "./utils/colorConsole";
import http from "http";
import { Server } from "socket.io";
import { authenticateToken } from "./middleware/authenticateToken";
import jwt from "jsonwebtoken";

export const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
    path: '/custom/socket.io',
    cors: {
        origin: process.env.APP_MODE === "DEV" ? process.env.FORNT_END_URI_DEV : process.env.FORNT_END_URI_PROD,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'admin-authorization'], 
        credentials: true, 
    },
});

ConfigDB();
createUsersTable();
// clearUsersTables()
InitRoutes(app);

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

export const userSockets = new Map<number, string>(); 

io.on("connection", (socket) => {
    const token = socket.handshake.auth.token;
    if(!token){
        console.log("No token provided, disconecting...");
        return socket.disconnect();
    }

    try{

        const decodedUser = jwt.verify(token as string, JWT_SECRET_KEY || "");
        const userId = (decodedUser as any).id;

        socket.data.userId = userId;
        userSockets.set(userId, socket.id);

        console.log(`User connected: userId=${userId}, socketId=${socket.id}`);

        socket.emit("socket_id", socket.id);

        socket.on('new_global_notification', (notification) => {
            console.log("Sended notf: ", notification)
        })
        socket.on("disconnect", ()=>{
            console.log(`User disconnected: userId=${userId}`);
            userSockets.delete(userId);
        });

    } catch (error){
        console.error("Invalid ty: error: ", error);
        socket.disconnect();
    }
});


server.listen(PORT, ()=>{
    console.log(colorize(`Server was started on port ${PORT}`, 'green', 'black', 'bold'));
    setTimeout(() => {
        ReturnEndPoints(app);
    }, 2000);
})

app.set("io", io); 
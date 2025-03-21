import express, { Express } from "express";
import InitRoutes from "../routes/router";
import ReturnEndPoints from "../utils/endPointsList";
import ConfigDB from "../config/db";
import { clearUsersTables, createUsersTable } from "../config/createTable";
import colorize from "../utils/colorConsole";
import http from "http";
import { Server } from "socket.io";

const app: Express = express();
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

app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
});

export default function InitServer(): void {
    ConfigDB();
    createUsersTable();
    // clearUsersTables()
    InitRoutes(app);

    const PORT = process.env.PORT || 7003

    io.on('connection', (socket) => {
        console.log('User connected with socket id:', socket.id);
    
        socket.on("disconnect", () => {
            console.log(colorize("A user disconnected", "red", "black", "bold"));
        });
    
        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });
    
        socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    });

    server.listen(PORT, ()=>{
        console.log(colorize(`Server was started on port ${PORT}`, 'green', 'black', 'bold'));
        setTimeout(() => {
            ReturnEndPoints(app);
        }, 2000);
    })

    app.set("io", io); 
}
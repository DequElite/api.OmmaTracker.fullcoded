import express, { Express } from "express";
import cookieParser from "cookie-parser";
import RegisterRouter from "./register/RegisterRouter";
import AuthRouter from "./auth/AuthRouter";
import DataRouter from "./data/DataRouter";
import { authenticateToken } from "../middleware/authenticateToken";

const API_DIR = "/api";

const cors = require('cors');

export default function InitRoutes(app:Express): void {
    app.use(express.json());
    app.use(cookieParser());

    app.use(cors({
        origin: 'https://omma-tracker-fullcoded.vercel.app',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'], 
        credentials: true, 
    }));

    app.use(`${API_DIR}/register`, RegisterRouter);
    app.use(`${API_DIR}/auth`, AuthRouter);
    app.use(`${API_DIR}/data`, DataRouter);
}



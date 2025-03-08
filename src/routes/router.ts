import express, { Express } from "express";
import cookieParser from "cookie-parser";
import RegisterRouter from "./register/RegisterRouter";
import AuthRouter from "./auth/AuthRouter";
import DataRouter from "./data/DataRouter";
import colorize from "../utils/colorConsole";

const API_DIR = "/api";

const cors = require('cors');
require("dotenv").config();

export default function InitRoutes(app:Express): void {
    app.use(express.json());
    app.use(cookieParser());

    app.use(cors({
        origin: process.env.APP_MODE === "DEV" ? process.env.FORNT_END_URI_DEV : process.env.FORNT_END_URI_PROD,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'], 
        credentials: true, 
    }));

    app.get('/api/check-is-server-avaible', (req,res)=>{
        console.log(colorize("Sevrver is avaible", 'magenta', 'blue', 'bold'))
        res.status(200).json({ message: "Server is available" });
    })
    app.use(`${API_DIR}/register`, RegisterRouter);
    app.use(`${API_DIR}/auth`, AuthRouter);
    app.use(`${API_DIR}/data`, DataRouter);
}



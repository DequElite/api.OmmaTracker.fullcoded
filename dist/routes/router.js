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
const API_DIR = "/api";
const cors = require('cors');
require("dotenv").config();
function InitRoutes(app) {
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use(cors({
        origin: process.env.APP_MODE === "DEV" ? process.env.FORNT_END_URI_DEV : process.env.FORNT_END_URI_PROD,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }));
    app.use(`${API_DIR}/register`, RegisterRouter_1.default);
    app.use(`${API_DIR}/auth`, AuthRouter_1.default);
    app.use(`${API_DIR}/data`, DataRouter_1.default);
}

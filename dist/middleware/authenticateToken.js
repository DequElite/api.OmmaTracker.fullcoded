"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
    if (!JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, JWT_SECRET_KEY);
        req.user = decodedToken;
        return next();
    }
    catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};
exports.authenticateToken = authenticateToken;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSAToken = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const userToken = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    if (!userToken) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
    if (!JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }
    try {
        const decodedUser = jsonwebtoken_1.default.verify(userToken, JWT_SECRET_KEY);
        req.user = decodedUser;
        req.isAdmin = false;
        return next();
    }
    catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};
exports.authenticateToken = authenticateToken;
const authenticateSAToken = (req, res, next) => {
    var _a;
    const adminAuthHeader = req.headers["admin-authorization"];
    const adminToken = Array.isArray(adminAuthHeader) ? (_a = adminAuthHeader[0]) === null || _a === void 0 ? void 0 : _a.split(" ")[1] : adminAuthHeader === null || adminAuthHeader === void 0 ? void 0 : adminAuthHeader.split(" ")[1];
    if (!adminToken) {
        res.status(401).json({ message: "No admin token provided" });
        return;
    }
    if (!JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }
    try {
        const decodedAdmin = jsonwebtoken_1.default.verify(adminToken, JWT_SECRET_KEY);
        req.user = decodedAdmin;
        req.isAdmin = true;
        return next();
    }
    catch (error) {
        console.warn("Invalid admin token:", error);
        res.status(403).json({ message: "Invalid admin token" });
        return;
    }
};
exports.authenticateSAToken = authenticateSAToken;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../../config/db");
const RefreshRouter = (0, express_1.Router)();
require("dotenv").config();
const JWT_TOKEN_LIFETIME = process.env.JWT_TOKEN_LIFE;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
RefreshRouter.get('/refresh', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(400).json({ message: "Refresh token is required" });
        return;
    }
    if (!JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET_KEY);
        const result = yield db_1.pool.query(`
            SELECT * FROM Users
            WHERE id = $1
        `, [decodedToken.id]);
        if (result.rowCount === 0) {
            throw new Error("USER_NOT_FOUND");
        }
        const user = result.rows[0];
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET_KEY || "", { expiresIn: "1h" });
        res.status(200).json({
            accessToken: newAccessToken
        });
    }
    catch (error) {
        console.error("Error refreshing token: ", error);
        res.status(403).json({ message: "Failed to refresh token" });
    }
}));
exports.default = RefreshRouter;

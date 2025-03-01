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
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../../../config/db");
const SignInRouter = (0, express_1.Router)();
require("dotenv").config();
const JWT_TOKEN_LIFETIME = process.env.JWT_TOKEN_LIFE || "1h";
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = 10;
const SignInUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.pool.query(`
        SELECT * FROM Users
        WHERE email = $1
    `, [email]);
    if (result.rowCount === 0) {
        throw new Error("USER_NOT_FOUND");
    }
    const user = result.rows[0];
    const IsValidPassword = yield bcrypt_1.default.compare(password, user.password);
    if (!IsValidPassword) {
        throw new Error("INVALID_PASSWORD");
    }
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET_KEY || "", { expiresIn: "1h" });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET_KEY || "", { expiresIn: "30d" });
    yield db_1.pool.query(`
        UPDATE UsersAdditional
        SET refreshToken = $1
        WHERE user_id = $2
    `, [refreshToken, user.id]);
    return { accessToken, refreshToken };
});
SignInRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const { accessToken, refreshToken } = yield SignInUser(email, password);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        });
        res.status(201).json({
            message: "User was signin ssuccessfuly",
            accesToken: accessToken,
        });
    }
    catch (error) {
        console.error(error);
        if (error.message === "USER_NOT_FOUND") {
            res.status(404).json({ error: "Account was not found" });
        }
        else if (error.message === "INVALID_PASSWORD") {
            res.status(422).json({ error: "Invalid password" });
        }
        res.status(400).json({
            message: error.message || 'An error occurred during the sign in process'
        });
    }
}));
exports.default = SignInRouter;

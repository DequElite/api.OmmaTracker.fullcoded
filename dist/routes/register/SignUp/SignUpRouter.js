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
const SignUpRouter = (0, express_1.Router)();
require("dotenv").config();
const JWT_TOKEN_LIFETIME = process.env.JWT_TOKEN_LIFE || "1h";
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = 10;
const CheckUser = (username, email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.pool.query(`
        SELECT * FROM Users 
        WHERE username = $1 OR email = $2
    `, [username, email]);
    if (result.rows.length > 0) {
        throw new Error('USER_ALREDY_EXISTS');
    }
});
const CreateUser = (username, password, email) => __awaiter(void 0, void 0, void 0, function* () {
    yield CheckUser(username, email);
    const HashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
    const newUser = yield db_1.pool.query(`
        INSERT INTO Users (username, password, email) 
        VALUES ($1, $2, $3)
        RETURNING id, username, email
    `, [username, HashedPassword, email]);
    return newUser.rows[0];
});
const CreateUserAdditionalInfo = (userId, refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.pool.query(`
        INSERT INTO UsersAdditional (user_id, refreshToken)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET refreshToken = $2
    `, [userId, refreshToken]);
});
SignUpRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
    console.log(req.body);
    try {
        const newUser = yield CreateUser(username, password, email);
        const accessToken = jsonwebtoken_1.default.sign({ id: newUser.id, username: newUser.username, email: newUser.email }, JWT_SECRET_KEY || "", { expiresIn: "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: newUser.id }, JWT_SECRET_KEY || "", { expiresIn: "30d" });
        yield CreateUserAdditionalInfo(newUser.id, refreshToken);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.APP_MODE !== "DEV",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: process.env.APP_MODE === "DEV" ? "strict" : "lax",
        });
        res.status(201).json({
            message: "User was created ssuccessfuly",
            accessToken: accessToken,
            user: newUser
        });
    }
    catch (error) {
        console.error(error);
        if (error.message === "USER_ALREDY_EXISTS") {
            res
                .status(409)
                .json({ error: "User with this username or email already exists" });
        }
        res.status(400).json({
            message: error.message || 'An error occurred during the sign up process'
        });
    }
}));
exports.default = SignUpRouter;

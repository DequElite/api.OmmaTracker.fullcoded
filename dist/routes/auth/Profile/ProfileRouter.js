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
const authenticateToken_1 = require("../../../middleware/authenticateToken");
const db_1 = require("../../../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ProfileRouter = (0, express_1.Router)();
require("dotenv").config();
const JWT_TOKEN_LIFETIME = process.env.JWT_TOKEN_LIFE || "1h";
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = 10;
ProfileRouter.get('/profile', authenticateToken_1.authenticateToken, (req, res) => {
    const user = req.user;
    res.json({ message: 'access granted', user });
});
ProfileRouter.post('/profile/change', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { NewUsername, OldPassword, NewPassword } = req.body;
    console.log("Get data /profile/change: ", req.body);
    try {
        yield db_1.pool.query(`
            UPDATE Users
            SET username = $1
            WHERE email = $2
        `, [NewUsername, user.email]);
        if (OldPassword !== null && NewPassword !== null) {
            const result = yield db_1.pool.query(`
                SELECT * FROM Users
                WHERE email = $1
            `, [user.email]);
            const hashedPassword = result.rows[0].password;
            const isBcryptHash = /^\$2[abxy]\$\d{2}\$/.test(hashedPassword);
            if (isBcryptHash) {
                const IsValidPassword = yield bcrypt_1.default.compare(OldPassword, hashedPassword);
                if (!IsValidPassword) {
                    throw new Error("INVALID_PASSWORD");
                }
            }
            else {
                if (OldPassword !== hashedPassword) {
                    throw new Error("INVALID_PASSWORD");
                }
            }
            const NewHashedPassword = yield bcrypt_1.default.hash(NewPassword, SALT_ROUNDS);
            yield db_1.pool.query(`
                UPDATE Users
                SET password = $1
                WHERE email = $2
            `, [NewHashedPassword, user.email]);
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user.id, username: NewUsername, email: user.email }, JWT_SECRET_KEY || "", { expiresIn: "1h" });
        res.status(200).json({
            message: "User data was changed successfully",
            accessToken: newAccessToken
        });
    }
    catch (error) {
        console.error(error);
        if (error.message === "INVALID_PASSWORD") {
            res.status(422).json({ error: "Invalid password" });
        }
        res.status(400).json({
            message: error.message || 'An error occurred during the change user data process'
        });
    }
}));
exports.default = ProfileRouter;

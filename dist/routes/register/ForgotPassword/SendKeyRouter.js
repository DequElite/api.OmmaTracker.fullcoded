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
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = require("../../../config/db");
const SendKeyRouter = (0, express_1.Router)();
require("dotenv").config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_KEY,
    },
});
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        });
        console.log("Email sent success");
    }
    catch (error) {
        console.error("Error at sending verification email: ", error);
    }
});
SendKeyRouter.post('/send-key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const result = yield db_1.pool.query(`
            SELECT * FROM Users
            WHERE email = $1
        `, [email]);
        if (result.rowCount === 0) {
            throw new Error("USER_NOT_FOUND");
        }
        const user = result.rows[0];
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpireAt = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const existingAdditional = yield db_1.pool.query(`
            SELECT * FROM UsersAdditional 
            WHERE user_id = $1
        `, [user.id]);
        if (existingAdditional.rows.length > 0) {
            yield db_1.pool.query(`
                UPDATE UsersAdditional 
                SET resetToken = $1, resetTokenExpireAt = $2
                WHERE user_id = $3
            `, [resetToken, resetTokenExpireAt, user.id]);
        }
        else {
            yield db_1.pool.query(`
                INSERT INTO UsersAdditional (user_id, resetToken, resetTokenExpireAt)
                VALUES ($1, $2, $3)
            `, [user.id, resetToken, resetTokenExpireAt]);
        }
        const resetLink = `${process.env.EMAIL_RESET_LINK}${resetToken}`;
        try {
            yield sendEmail(email, "Password recovery link", `
                Hello! \n 
                Here is a link to update your password, please follow it to enter a new account password for the Omma Tracker app ${resetLink}
                `);
            res.status(200).json({
                message: "Email to reset password sended",
                resedTokenExpireAt: resetTokenExpireAt
            });
        }
        catch (emailError) {
            yield db_1.pool.query(`
                UPDATE UsersAdditional 
                SET resetToken = $1, resetTokenExpireAt = $2
                WHERE user_id = $3
            `, [null, null, user.id]);
            console.error("Error sending verification email:", emailError);
            res.status(422).json({ message: "Failed to send verification email" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "error at send-key" });
        console.error("Error at send-code", error);
    }
}));
exports.default = SendKeyRouter;

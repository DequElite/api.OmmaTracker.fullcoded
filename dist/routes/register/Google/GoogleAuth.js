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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../../config/db");
const crypto_1 = __importDefault(require("crypto"));
const GoogleAuth = (0, express_1.Router)();
require("dotenv").config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "";
const APP_MODE = process.env.APP_MODE || "DEV";
const CALLBACK_URL = APP_MODE === "PROD"
    ? process.env.CALLBACK_URL_PROD
    : process.env.CALLBACK_URL_DEV;
const CLIENT_URL = APP_MODE === "PROD"
    ? process.env.CLIENT_URL_PROD
    : process.env.CLIENT_URL_DEV;
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_CLIENT_ID || "",
    clientSecret: GOOGLE_CLIENT_SECRET || "",
    callbackURL: CALLBACK_URL,
    passReqToCallback: true
}, (_req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    const email = profile.emails ? profile.emails[0].value : "";
    const username = profile.username || profile.displayName || email.split('@')[0];
    console.log("APP_MODE:", APP_MODE);
    console.log("CALLBACK_URL:", CALLBACK_URL);
    console.log("CLIENT_URL:", CLIENT_URL);
    try {
        let user = yield db_1.pool.query(`
                    SELECT * FROM Users 
                    WHERE email = $1
                `, [email]);
        if (user.rows.length === 0) {
            const newUserPassword = crypto_1.default.randomBytes(16).toString("hex");
            const newUser = yield db_1.pool.query(`
                        INSERT INTO Users (username, password, email) 
                        VALUES ($1, $2, $3)
                        RETURNING id, username, email
                    `, [username, newUserPassword, email]);
            user = newUser;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email }, JWT_SECRET_KEY || "", { expiresIn: "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.rows[0].id }, JWT_SECRET_KEY || "", { expiresIn: "30d" });
        const existingAdditional = yield db_1.pool.query(`
                    SELECT * FROM UsersAdditional 
                    WHERE user_id = $1
                `, [user.rows[0].id]);
        if (existingAdditional.rows.length > 0) {
            yield db_1.pool.query(`
                        UPDATE UsersAdditional 
                        SET refreshToken = $1
                        WHERE user_id = $2
                    `, [refreshToken, user.rows[0].id]);
        }
        else {
            yield db_1.pool.query(`
                        INSERT INTO UsersAdditional (user_id, refreshToken)
                        VALUES ($1, $2)
                    `, [user.rows[0].id, refreshToken]);
        }
        return done(null, { accessToken, refreshToken });
    }
    catch (error) {
        return done(error, undefined);
    }
})));
GoogleAuth.get('/google', passport_1.default.authenticate("google", { scope: ["email", "profile"] }));
GoogleAuth.get('/google/callback', passport_1.default.authenticate("google", { session: false }), (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: "Authorization failed" });
        return;
    }
    const { refreshToken, accessToken } = req.user;
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.APP_MODE === "PROD",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: process.env.APP_MODE === "DEV" ? "strict" : "none",
    });
    res.redirect(`${CLIENT_URL}/home?accessToken=${accessToken}`);
});
exports.default = GoogleAuth;

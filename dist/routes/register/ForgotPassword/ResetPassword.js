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
const db_1 = require("../../../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const validateSignData_1 = require("../../../middleware/validateSignData");
const ResetPasswordRouter = (0, express_1.Router)();
const SALT_ROUNDS = 10;
ResetPasswordRouter.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { resetToken, newUserPassword } = req.body;
    console.log(req.body);
    const ValidateResult = validateSignData_1.passwordSchema.safeParse(newUserPassword);
    if (!ValidateResult.success) {
        res.status(400).json({ errors: ValidateResult.error.format(), message: "DATA_NOT_VALIDATED" });
        throw new Error("DATA_NOT_VALIDATED");
    }
    try {
        const resultUserAdditional = yield db_1.pool.query(`
            SELECT * FROM UsersAdditional
            WHERE resetToken = $1
        `, [resetToken]);
        if (resultUserAdditional.rowCount === 0) {
            throw new Error("TOKEN_NOT_FOUND");
        }
        if (new Date() > new Date(resultUserAdditional.rows[0].resetTokenExpireAt)) {
            throw new Error("TOKEN_EXPIRED");
        }
        yield db_1.pool.query(`
            UPDATE UsersAdditional 
            SET resetToken = $1, resetTokenExpireAt = $2
            WHERE user_id = $3
        `, [null, null, resultUserAdditional.rows[0].user_id]);
        const HashedPassword = yield bcrypt_1.default.hash(newUserPassword, SALT_ROUNDS);
        yield db_1.pool.query(`
            UPDATE Users 
            SET password = $1
            WHERE id = $2
        `, [HashedPassword, resultUserAdditional.rows[0].user_id]);
        res.status(200).json({
            message: "Password reseted successfully",
        });
    }
    catch (error) {
        res.status(500).json({ message: "error at reset-password" });
        console.error("Error at send-code", error);
    }
}));
exports.default = ResetPasswordRouter;

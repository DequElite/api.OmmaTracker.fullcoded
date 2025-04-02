import { Router } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { pool } from "../../../config/db";
import { emailSchema } from "../../../middleware/validateSignData";

const SendKeyRouter = Router();

require("dotenv").config();
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT), 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_KEY,
    },
} as SMTPTransport.Options); 

const sendEmail = async (to:any, subject:any, html:any) => {
    try{
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to,
            subject,
            html
        })
        console.log("Email sent success");
    } catch (error) {
        console.error("Error at sending verification email: ", error);
    }
}


SendKeyRouter.post('/send-key', async (req,res)=>{
    const { email } = req.body;

    const ValidateResult = emailSchema.safeParse(email);
    if(!ValidateResult.success){
        res.status(400).json({errors: ValidateResult.error.format(), message: "DATA_NOT_VALIDATED"});
        throw new Error("DATA_NOT_VALIDATED")
    }

    try{
        const result = await pool.query(`
            SELECT * FROM Users
            WHERE email = $1
        `, [email]);

        if(result.rowCount === 0) {
            throw new Error("USER_NOT_FOUND")
        }

        const user = result.rows[0];

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpireAt = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

        const existingAdditional = await pool.query(`
            SELECT * FROM UsersAdditional 
            WHERE user_id = $1
        `, [user.id]);

        if (existingAdditional.rows.length > 0) {
            await pool.query(`
                UPDATE UsersAdditional 
                SET resetToken = $1, resetTokenExpireAt = $2
                WHERE user_id = $3
            `, [resetToken, resetTokenExpireAt, user.id]);
        } else {
            await pool.query(`
                INSERT INTO UsersAdditional (user_id, resetToken, resetTokenExpireAt)
                VALUES ($1, $2, $3)
            `, [user.id, resetToken, resetTokenExpireAt]);
        }

        const resetLinkDomain = process.env.APP_MODE === "DEV" ? process.env.EMAIL_DEV_RESET_LINK : process.env.EMAIL_PROD_RESET_LINK;
        const resetLink = `${resetLinkDomain}${resetToken}`;

        try{
            await sendEmail(
                email,
                "Password recovery link",
                `
                Hello! \n 
                Here is a link to update your password, please follow it to enter a new account password for the Omma Tracker app ${resetLink}
                `
            )

            res.status(200).json({
                message: "Email to reset password sended",
                resedTokenExpireAt: resetTokenExpireAt
            });
        }catch (emailError) {
            await pool.query(`
                UPDATE UsersAdditional 
                SET resetToken = $1, resetTokenExpireAt = $2
                WHERE user_id = $3
            `, [null, null, user.id]);

            console.error("Error sending verification email:", emailError);
            res.status(422).json({ message: "Failed to send verification email" });
        }

    } catch (error) {
        res.status(500).json({message:"error at send-key"});
        console.error("Error at send-code", error);
    }
})

export default SendKeyRouter;

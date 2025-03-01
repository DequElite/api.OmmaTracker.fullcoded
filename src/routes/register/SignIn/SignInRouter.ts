import {Router} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { pool } from "../../../config/db";

const SignInRouter = Router();

require("dotenv").config();
const JWT_TOKEN_LIFETIME = process.env.JWT_TOKEN_LIFE  || "1h"; 
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = 10;

const SignInUser = async (email:string, password:string) => {
    const result = await pool.query(`
        SELECT * FROM Users
        WHERE email = $1
    `, [email])

    if(result.rowCount === 0) {
        throw new Error("USER_NOT_FOUND")
    }

    const user = result.rows[0];

    const IsValidPassword = await bcrypt.compare(password, user.password);
    if (!IsValidPassword){
        throw new Error("INVALID_PASSWORD")
    }

    const accessToken = jwt.sign(
        {id: user.id, username: user.username, email: user.email},
        JWT_SECRET_KEY || "",
        { expiresIn: "1h" }
    )

    const refreshToken = jwt.sign(
        {id: user.id},
        JWT_SECRET_KEY || "",
        { expiresIn: "30d" }
    )

    await pool.query(`
        UPDATE UsersAdditional
        SET refreshToken = $1
        WHERE user_id = $2
    `, [refreshToken, user.id]);

    return {accessToken, refreshToken};
}

SignInRouter.post('/signin', async (req,res)=>{
    const {email, password} = req.body;

    try{
        const {accessToken, refreshToken} = await SignInUser(email, password);

        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            secure:false,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        })


        res.status(201).json({
            message: "User was signin ssuccessfuly",
            accesToken: accessToken, 
        })

    } catch (error) {
        console.error(error);
        if ((error as any).message === "USER_NOT_FOUND") {
            res.status(404).json({ error: "Account was not found" });
        } else if ((error as any).message === "INVALID_PASSWORD") {
            res.status(422).json({ error: "Invalid password" });
        }
        res.status(400).json({
            message: (error as any).message || 'An error occurred during the sign in process'
        });
    }
});

export default SignInRouter;
import {Router} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { pool } from "../../../config/db";

const SignUpRouter = Router();

require("dotenv").config();
const JWT_TOKEN_LIFETIME = process.env.JWT_TOKEN_LIFE  || "1h"; 
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = 10;

const CheckUser = async (username:string, email:string) => {
    const result = await pool.query(`
        SELECT * FROM Users 
        WHERE username = $1 OR email = $2
    `, [username, email]);
    if (result.rows.length > 0) {
        throw new Error('USER_ALREDY_EXISTS');
    }
}

const CreateUser = async (username:string, password:string, email:string) => {
    await CheckUser(username, email);

    const HashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await pool.query(`
        INSERT INTO Users (username, password, email) 
        VALUES ($1, $2, $3)
        RETURNING id, username, email
    `, [username, HashedPassword, email]);

    return newUser.rows[0];
}

const CreateUserAdditionalInfo = async (userId: number, refreshToken: string) => {
    await pool.query(`
        INSERT INTO UsersAdditional (user_id, refreshToken)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET refreshToken = $2
    `, [userId, refreshToken]);    
}


SignUpRouter.post('/signup', async (req, res)=>{
    const {username, password, email} = req.body;
    console.log(req.body)
    try{
        const newUser = await CreateUser(username, password, email);

        const accessToken = jwt.sign(
            {id: newUser.id, username: newUser.username, email: newUser.email},
            JWT_SECRET_KEY || "",
            { expiresIn: "1h" }
        )

        const refreshToken = jwt.sign(
            {id: newUser.id},
            JWT_SECRET_KEY || "",
            { expiresIn: "30d" }
        )

        await CreateUserAdditionalInfo(newUser.id, refreshToken);

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
        })

    } catch (error){
        console.error(error);
        if((error as any).message === "USER_ALREDY_EXISTS"){
            res
                .status(409)
                .json({ error: "User with this username or email already exists" });
        }
        res.status(400).json({
            message: (error as any).message || 'An error occurred during the sign up process'
        });
    }
})

export default SignUpRouter;
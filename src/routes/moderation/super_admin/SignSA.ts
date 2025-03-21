import {Router} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { pool } from "../../../config/db";

const SignSARouter = Router();

require("dotenv").config();
const JWT_TOKEN_LIFETIME = process.env.JWT_TOKEN_LIFE  || "1h"; 
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = 10;

const SignSA = async (supername:string, superpassword:string) => {
    const result = await pool.query(`
        SELECT * FROM SuperAdmin
        WHERE supername = $1
    `, [supername]);

    if(result.rowCount === 0) {
        throw new Error("NOT_SA")
    }
    
    const sa = result.rows[0];
    
    const IsValidPassword = await bcrypt.compare(superpassword, sa.superpassword);
    if (!IsValidPassword){
        throw new Error("INVALID_PASSWORD")
    }

    const accessToken = jwt.sign(
        {id: sa.id, supername: sa.supername, superemail: sa.superemail},
        JWT_SECRET_KEY || "",
        { expiresIn: "1h" }
    )
    
    const refreshToken = jwt.sign(
        {id: sa.id},
        JWT_SECRET_KEY || "",
        { expiresIn: "3d" }
    )

    return {accessToken, refreshToken};
}

SignSARouter.post('/sign', async (req,res)=>{
    const {supername, superpassword} = req.body;

    try{
        const {accessToken, refreshToken} = await SignSA(supername, superpassword);

        res.cookie("refreshSAToken", refreshToken, {
            httpOnly: true,
            secure: process.env.APP_MODE === "PROD",
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: process.env.APP_MODE === "DEV" ? "strict" : "none",
        });


        res.status(201).json({
            message: "SA was signin ssuccessfuly",
            accessToken: accessToken, 
        })

    } catch (error) {
        console.error(error);
        if ((error as any).message === "NOT_SA") {
            res.status(404).json({ error: "Account was not found" });
        } else if ((error as any).message === "INVALID_PASSWORD") {
            res.status(422).json({ error: "Invalid password" });
        }
        res.status(400).json({
            message: (error as any).message || 'An error occurred during the sign in process'
        });
    }
})

export default SignSARouter;

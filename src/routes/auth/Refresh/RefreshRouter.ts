import {Router} from "express";
import jwt from "jsonwebtoken";
import { pool } from "../../../config/db";

const RefreshRouter = Router();

require("dotenv").config();
const JWT_TOKEN_LIFETIME = process.env.JWT_TOKEN_LIFE; 
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

RefreshRouter.get('/refresh', async (req,res)=>{
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        res.status(400).json({ message: "Refresh token is required" });
        return;
    }

    if (!JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }

    try{
        const decodedToken: any = jwt.verify(refreshToken, JWT_SECRET_KEY);

        const result = await pool.query(`
            SELECT * FROM Users
            WHERE id = $1
        `, [decodedToken.id]);

        if(result.rowCount === 0) {
            throw new Error("USER_NOT_FOUND")
        }

        const user = result.rows[0];

        const newAccessToken = jwt.sign(
            {id: user.id, username: user.username, email: user.email},
            JWT_SECRET_KEY || "",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            accessToken: newAccessToken
        });

    } catch (error){
        console.error("Error refreshing token: ", error);
        res.status(403).json({ message: "Failed to refresh token" });
    }
});

export default RefreshRouter;

import {Router} from "express";
import { authenticateToken } from "../../../middleware/authenticateToken";
import { pool } from "../../../config/db";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const ProfileRouter = Router();

require("dotenv").config();
const JWT_TOKEN_LIFETIME = process.env.JWT_TOKEN_LIFE  || "1h"; 
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = 10;

ProfileRouter.get('/profile', authenticateToken, (req,res)=>{
    const user = (req as any).user;
    res.json({message: 'access granted', user});
});

ProfileRouter.post('/profile/change', authenticateToken, async (req,res)=>{
    const user = (req as any).user;
    const { NewUsername, OldPassword, NewPassword } = req.body;
    console.log("Get data /profile/change: ", req.body)

    try{
        await pool.query(`
            UPDATE Users
            SET username = $1
            WHERE email = $2
        `, [NewUsername, user.email]);

        if(OldPassword !== null && NewPassword !== null) {

            const result = await pool.query(`
                SELECT * FROM Users
                WHERE email = $1
            `, [user.email])

            const hashedPassword = result.rows[0].password;

            const isBcryptHash = /^\$2[abxy]\$\d{2}\$/.test(hashedPassword);

            if (isBcryptHash) {
                const IsValidPassword = await bcrypt.compare(OldPassword, hashedPassword);
                if (!IsValidPassword) {
                    throw new Error("INVALID_PASSWORD");
                }
            } else {
                if (OldPassword !== hashedPassword) {
                    throw new Error("INVALID_PASSWORD");
                }
            }
        
            const NewHashedPassword = await bcrypt.hash(NewPassword, SALT_ROUNDS);
            await pool.query(`
                UPDATE Users
                SET password = $1
                WHERE email = $2
            `, [NewHashedPassword, user.email]);

        }

        const newAccessToken = jwt.sign(
            {id: user.id, username: NewUsername, email: user.email},
            JWT_SECRET_KEY || "",
            { expiresIn: "1h" }
        )

        res.status(200).json({ 
            message: "User data was changed successfully", 
            accessToken: newAccessToken 
        });

    } catch (error) {
        console.error(error);
        if ((error as any).message === "INVALID_PASSWORD") {
            res.status(422).json({ error: "Invalid password" });
        }
        res.status(400).json({
            message: (error as any).message || 'An error occurred during the change user data process'
        });
    }
})

export default ProfileRouter;

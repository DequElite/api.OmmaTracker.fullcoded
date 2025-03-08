import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export const authenticateToken = (req:Request, res:Response, next:NextFunction): void => {
    const authHeader = req.headers.authorization;

    const token = authHeader?.split(" ")[1];
    
    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }    
    
    if (!JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }
    
    try{
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        (req as any).user = decodedToken;
        return next();
    } catch (error) {
        res.status(403).json({message: "Invalid token"});
    }
}
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    const userToken = authHeader?.split(" ")[1];

    if (!userToken) {
        res.status(401).json({ message: "No token provided" });
        return;
    }

    if (!JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }

    try {
        const decodedUser = jwt.verify(userToken as string, JWT_SECRET_KEY);
        (req as any).user = decodedUser;
        (req as any).isAdmin = false;
        return next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

export const authenticateSAToken = (req: Request, res: Response, next: NextFunction): void => {
    const adminAuthHeader = req.headers["admin-authorization"];
    const adminToken = Array.isArray(adminAuthHeader) ? adminAuthHeader[0]?.split(" ")[1] : adminAuthHeader?.split(" ")[1];

    if (!adminToken) {
       res.status(401).json({ message: "No admin token provided" });
       return;
    }

    if (!JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }

    try {
        const decodedAdmin = jwt.verify(adminToken, JWT_SECRET_KEY);
        (req as any).user = decodedAdmin;
        (req as any).isAdmin = true; 
        return next();
    } catch (error) {
        console.warn("Invalid admin token:", error);
        res.status(403).json({ message: "Invalid admin token" });
        return;
    }
};

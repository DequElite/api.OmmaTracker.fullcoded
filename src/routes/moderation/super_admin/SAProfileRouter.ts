import {Router} from "express";
import { authenticateSAToken } from "../../../middleware/authenticateToken";
import { pool } from "../../../config/db";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const SAProfileRouter = Router();

SAProfileRouter.get('/profile', authenticateSAToken, (req,res)=>{
    const sa = (req as any).user;
    console.log(sa)
    res.json({message: 'access granted', sa:sa, isAdmin: (req as any).isAdmin});
});

export default SAProfileRouter;

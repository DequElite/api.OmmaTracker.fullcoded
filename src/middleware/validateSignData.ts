import { error } from "console";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(5, "Username must have at least 5 characters!")
  .regex(/^[a-zA-Z0-9]+$/, "Only numbers and letters!");

export const emailSchema = z.string().email("Incorrect mail format!");

export const passwordSchema = z
  .string()
  .min(8, "The password must contain at least 8 characters!")
  .regex(/[a-z]/, "The password must contain lowercase letters!")
  .regex(/[A-Z]/, "The password must contain uppercase letters!")
  .regex(/[0-9]/, "The password must contain numbers!")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "The password must contain special characters!");

export const SignSchema = z.object({
  username: usernameSchema.optional(),
  email: emailSchema,
  password: passwordSchema,
});

export const validateSign = (req: Request, res: Response, next: NextFunction) => {
    const ValidateResult = SignSchema.safeParse(req.body);
    if(!ValidateResult.success){
        res.status(400).json({errors: ValidateResult.error.format(), message: "DATA_NOT_VALIDATED"});
        return
    }
    return next();
}
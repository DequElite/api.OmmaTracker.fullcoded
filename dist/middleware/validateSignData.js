"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSign = exports.SignSchema = exports.passwordSchema = exports.emailSchema = exports.usernameSchema = void 0;
const zod_1 = require("zod");
exports.usernameSchema = zod_1.z
    .string()
    .min(5, "Username must have at least 5 characters!")
    .regex(/^[a-zA-Z0-9]+$/, "Only numbers and letters!");
exports.emailSchema = zod_1.z.string().email("Incorrect mail format!");
exports.passwordSchema = zod_1.z
    .string()
    .min(8, "The password must contain at least 8 characters!")
    .regex(/[a-z]/, "The password must contain lowercase letters!")
    .regex(/[A-Z]/, "The password must contain uppercase letters!")
    .regex(/[0-9]/, "The password must contain numbers!")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "The password must contain special characters!");
exports.SignSchema = zod_1.z.object({
    username: exports.usernameSchema.optional(),
    email: exports.emailSchema,
    password: exports.passwordSchema,
});
const validateSign = (req, res, next) => {
    const ValidateResult = exports.SignSchema.safeParse(req.body);
    if (!ValidateResult.success) {
        res.status(400).json({ errors: ValidateResult.error.format(), message: "DATA_NOT_VALIDATED" });
        return;
    }
    return next();
};
exports.validateSign = validateSign;

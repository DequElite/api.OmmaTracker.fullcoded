"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SignUpRouter_1 = __importDefault(require("./SignUp/SignUpRouter"));
const SignInRouter_1 = __importDefault(require("./SignIn/SignInRouter"));
const GoogleAuth_1 = __importDefault(require("./Google/GoogleAuth"));
const SendKeyRouter_1 = __importDefault(require("./ForgotPassword/SendKeyRouter"));
const ResetPassword_1 = __importDefault(require("./ForgotPassword/ResetPassword"));
const RegisterRouter = (0, express_1.Router)();
RegisterRouter.use(SignUpRouter_1.default);
RegisterRouter.use(SignInRouter_1.default);
RegisterRouter.use(GoogleAuth_1.default);
RegisterRouter.use('/forgot-password', SendKeyRouter_1.default);
RegisterRouter.use(ResetPassword_1.default);
exports.default = RegisterRouter;

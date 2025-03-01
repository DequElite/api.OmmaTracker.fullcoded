import {Router} from "express";
import SignUpRouter from "./SignUp/SignUpRouter";
import SignInRouter from "./SignIn/SignInRouter";
import GoogleAuth from "./Google/GoogleAuth";
import SendKeyRouter from "./ForgotPassword/SendKeyRouter";
import ResetPasswordRouter from "./ForgotPassword/ResetPassword";

const RegisterRouter = Router();

RegisterRouter.use(SignUpRouter);
RegisterRouter.use(SignInRouter);
RegisterRouter.use(GoogleAuth);
RegisterRouter.use('/forgot-password', SendKeyRouter);
RegisterRouter.use(ResetPasswordRouter)

export default RegisterRouter;

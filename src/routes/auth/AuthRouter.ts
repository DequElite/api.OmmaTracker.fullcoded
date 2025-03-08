import {Router} from "express";
import ProfileRouter from "./Profile/ProfileRouter";
import RefreshRouter from "./Refresh/RefreshRouter";

const AuthRouter = Router();

AuthRouter.use(ProfileRouter);
AuthRouter.use(RefreshRouter);

export default AuthRouter;

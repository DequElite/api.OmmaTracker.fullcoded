import { Router } from "express";
import GlobalNotfsRouter from "./Global/GlobalNotfsRouter";

const NotificationsRouter = Router();

NotificationsRouter.use('/global', GlobalNotfsRouter);

export default NotificationsRouter;
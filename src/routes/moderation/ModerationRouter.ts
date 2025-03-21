import {Router} from "express";
import SignSARouter from "./super_admin/SignSA";
import SAProfileRouter from "./super_admin/SAProfileRouter";
import UsersRouter from "./users/UsersRouter";
import NotificationsSARouter from "./notifications/NotificationsSARouter";

const ModerationRouter = Router();

ModerationRouter.use('/super_admin', SignSARouter);
ModerationRouter.use('/super_admin', SAProfileRouter);
ModerationRouter.use(UsersRouter);
ModerationRouter.use(NotificationsSARouter);

export default ModerationRouter;

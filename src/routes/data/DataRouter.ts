import { Router } from "express";
import CreateTaskRouter from "./CreateTask/CreateTaskRouter";
import ReviewTaskRouter from "./ReviewTask/ReviewTaskRouter";

const DataRouter = Router();

DataRouter.use('/task', CreateTaskRouter);
DataRouter.use('/task/review', ReviewTaskRouter)

export default DataRouter;
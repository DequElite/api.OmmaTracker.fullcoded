"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CreateTaskRouter_1 = __importDefault(require("./CreateTask/CreateTaskRouter"));
const ReviewTaskRouter_1 = __importDefault(require("./ReviewTask/ReviewTaskRouter"));
const DataRouter = (0, express_1.Router)();
DataRouter.use('/task', CreateTaskRouter_1.default);
DataRouter.use('/task/review', ReviewTaskRouter_1.default);
exports.default = DataRouter;

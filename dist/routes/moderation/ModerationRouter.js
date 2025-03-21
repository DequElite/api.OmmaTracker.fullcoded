"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SignSA_1 = __importDefault(require("./super_admin/SignSA"));
const SAProfileRouter_1 = __importDefault(require("./super_admin/SAProfileRouter"));
const UsersRouter_1 = __importDefault(require("./users/UsersRouter"));
const NotificationsSARouter_1 = __importDefault(require("./notifications/NotificationsSARouter"));
const ModerationRouter = (0, express_1.Router)();
ModerationRouter.use('/super_admin', SignSA_1.default);
ModerationRouter.use('/super_admin', SAProfileRouter_1.default);
ModerationRouter.use(UsersRouter_1.default);
ModerationRouter.use(NotificationsSARouter_1.default);
exports.default = ModerationRouter;

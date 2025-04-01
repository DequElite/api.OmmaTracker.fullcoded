"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GlobalNotfsRouter_1 = __importDefault(require("./Global/GlobalNotfsRouter"));
const NotificationsRouter = (0, express_1.Router)();
NotificationsRouter.use('/global', GlobalNotfsRouter_1.default);
exports.default = NotificationsRouter;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProfileRouter_1 = __importDefault(require("./Profile/ProfileRouter"));
const RefreshRouter_1 = __importDefault(require("./Refresh/RefreshRouter"));
const AuthRouter = (0, express_1.Router)();
AuthRouter.use(ProfileRouter_1.default);
AuthRouter.use(RefreshRouter_1.default);
exports.default = AuthRouter;

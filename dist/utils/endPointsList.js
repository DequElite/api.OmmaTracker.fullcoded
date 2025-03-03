"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReturnEndPoints;
const colorConsole_1 = __importDefault(require("./colorConsole"));
const listEndpoints = require("express-list-endpoints");
function ReturnEndPoints(app) {
    const endpoints = listEndpoints(app);
    console.log((0, colorConsole_1.default)('Available routes:', 'gray', 'black', 'italic'));
    endpoints.forEach((endpoint) => {
        console.log((0, colorConsole_1.default)(`${endpoint.methods.join(', ')} ${endpoint.path}`, 'yellow', 'black', 'italic'));
    });
}

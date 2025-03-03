import { Express } from "express";
import colorize from "./colorConsole";

const listEndpoints = require("express-list-endpoints");

export default function ReturnEndPoints(app: Express): void {
    const endpoints = listEndpoints(app);
    console.log(colorize('Available routes:', 'blue', 'black', 'italic'));
    endpoints.forEach((endpoint:any) => {
        console.log(colorize(`${endpoint.methods.join(', ')} ${endpoint.path}`, 'yellow', 'black', 'italic'));
    });
}
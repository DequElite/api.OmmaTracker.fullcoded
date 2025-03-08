import express, { Express } from "express";
import InitRoutes from "../routes/router";
import ReturnEndPoints from "../utils/endPointsList";
import ConfigDB from "../config/db";
import { clearUsersTables, createUsersTable } from "../config/createTable";
import colorize from "../utils/colorConsole";

const app: Express = express();

export default function InitServer(): void {
    ConfigDB();
    createUsersTable();
    // clearUsersTables()
    InitRoutes(app);

    const PORT = process.env.PORT || 7003

    app.listen(PORT, ()=>{
        console.log(colorize(`Server was started on port ${PORT}`, 'green', 'black', 'bold'));
        setTimeout(() => {
            ReturnEndPoints(app);
        }, 2000);
    })
}
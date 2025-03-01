import { Pool } from "pg";
import colorize from "../utils/colorConsole";

require("dotenv").config();

const EXTERNAL_DB_URL = process.env.EXTERNAL_DB_URL;
const EXTERNAL_DB_URL2 = process.env.EXTERNAL_DB_URL2;

export const pool = new Pool({
    connectionString: EXTERNAL_DB_URL2,
    ssl: {rejectUnauthorized:false}
});

export default function ConfigDB(): void{
    pool.connect()
        .then(()=>console.log(colorize('SUCCESSFULL CONNECTED TO POSTGRESQL BY RENDER.COM', 'green', 'black', 'bold')))
        .catch(error=>console.error('ERROR TO CONNECT TO POSTGRESQL BY RENDER.COM: ', error));
}


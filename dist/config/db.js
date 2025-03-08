"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.default = ConfigDB;
const pg_1 = require("pg");
const colorConsole_1 = __importDefault(require("../utils/colorConsole"));
require("dotenv").config();
const EXTERNAL_DB_URL = process.env.EXTERNAL_DB_URL;
const EXTERNAL_DB_URL2 = process.env.EXTERNAL_DB_URL2;
exports.pool = new pg_1.Pool({
    connectionString: EXTERNAL_DB_URL2,
    ssl: { rejectUnauthorized: false }
});
function ConfigDB() {
    exports.pool.connect()
        .then(() => console.log((0, colorConsole_1.default)('SUCCESSFULL CONNECTED TO POSTGRESQL BY RENDER.COM', 'green', 'black', 'bold')))
        .catch(error => console.error('ERROR TO CONNECT TO POSTGRESQL BY RENDER.COM: ', error));
}

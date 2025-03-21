"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InitServer;
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("../routes/router"));
const endPointsList_1 = __importDefault(require("../utils/endPointsList"));
const db_1 = __importDefault(require("../config/db"));
const createTable_1 = require("../config/createTable");
const colorConsole_1 = __importDefault(require("../utils/colorConsole"));
const app = (0, express_1.default)();
function InitServer() {
    (0, db_1.default)();
    (0, createTable_1.createUsersTable)();
    // clearUsersTables()
    (0, router_1.default)(app);
    const PORT = process.env.PORT || 7003;
    app.listen(PORT, () => {
        console.log((0, colorConsole_1.default)(`Server was started on port ${PORT}`, 'green', 'black', 'bold'));
        setTimeout(() => {
            (0, endPointsList_1.default)(app);
        }, 2000);
    });
}

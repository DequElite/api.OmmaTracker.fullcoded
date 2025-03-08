"use strict";
// import InitServer from "./server/initServer";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// InitServer();
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("./routes/router"));
const endPointsList_1 = __importDefault(require("./utils/endPointsList"));
const db_1 = __importDefault(require("./config/db"));
const createTable_1 = require("./config/createTable");
const colorConsole_1 = __importDefault(require("./utils/colorConsole"));
exports.app = (0, express_1.default)();
(0, db_1.default)();
(0, createTable_1.createUsersTable)();
// clearUsersTables()
(0, router_1.default)(exports.app);
const PORT = process.env.PORT || 7003;
exports.app.listen(PORT, () => {
    console.log((0, colorConsole_1.default)(`Server was started on port ${PORT}`, 'green', 'black', 'bold'));
    setTimeout(() => {
        (0, endPointsList_1.default)(exports.app);
    }, 2000);
});

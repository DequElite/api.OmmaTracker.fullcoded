"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearUsersTables = exports.createUsersTable = void 0;
const colorConsole_1 = __importDefault(require("../utils/colorConsole"));
const db_1 = require("./db");
const createUsersTable = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_difficulty') THEN
                    CREATE TYPE task_difficulty AS ENUM ('easy', 'medium', 'hard');
                END IF;
            END $$;
        `);
        yield db_1.pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(70) NOT NULL
            )
        `);
        yield db_1.pool.query(`
            CREATE TABLE IF NOT EXISTS UsersAdditional (
                id SERIAL PRIMARY KEY,
                user_id INT UNIQUE NOT NULL,
                refreshToken VARCHAR(500),
                resetToken VARCHAR(500),  
                resetTokenExpireAt TIMESTAMP,
                blockUntil TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);
        yield db_1.pool.query(`
            CREATE TABLE IF NOT EXISTS UsersTasks (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                difficulty_level task_difficulty NOT NULL,
                name VARCHAR(255),
                description TEXT,
                date_to_complete TIMESTAMP,
                subTasksNumber INT,
                completedSubTasks INT,
                notification_sent BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);
        yield db_1.pool.query(`
            CREATE TABLE IF NOT EXISTS UsersSubtasks (
                id SERIAL PRIMARY KEY,
                task_id INT NOT NULL,
                text TEXT NOT NULL,
                is_completed BOOLEAN NOT NULL DEFAULT FALSE,
                FOREIGN KEY (task_id) REFERENCES UsersTasks(id) ON DELETE CASCADE
            )
        `);
        yield db_1.pool.query(`
            CREATE TABLE IF NOT EXISTS SuperAdmin (
                id SERIAL PRIMARY KEY,
                supername VARCHAR(50) NOT NULL UNIQUE,
                superemail VARCHAR(100) NOT NULL UNIQUE,
                superpassword VARCHAR(70) NOT NULL
            ) 
        `);
        yield db_1.pool.query(`
            CREATE TABLE IF NOT EXISTS Notifications (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                user_id INT NULL,  
                is_global BOOLEAN DEFAULT TRUE, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  
                CONSTRAINT chk_is_global CHECK (is_global IN (TRUE, FALSE)) 
            );
        `);
        yield db_1.pool.query(`
            CREATE TABLE IF NOT EXISTS NotificationReadStatus (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                notification_id INT NOT NULL,
                read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (notification_id) REFERENCES Notifications(id) ON DELETE CASCADE,
                UNIQUE (user_id, notification_id)  
            );

        `);
        const users = yield db_1.pool.query(`SELECT * FROM Users`);
        const usersAdditional = yield db_1.pool.query(`SELECT * FROM UsersAdditional`);
        // console.log(users.rows); // Печатаем результат первого запроса
        // console.log(usersAdditional.rows); 
        console.log((0, colorConsole_1.default)('Table was created (if it wasn\'t) \n', 'green', 'black', 'bold'));
    }
    catch (error) {
        console.error("Error at create table: ", error);
    }
});
exports.createUsersTable = createUsersTable;
const clearUsersTables = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.pool.query(`DELETE FROM UsersSubtasks`);
        yield db_1.pool.query(`DELETE FROM UsersTasks`);
        yield db_1.pool.query(`DELETE FROM UsersAdditional`);
        yield db_1.pool.query(`DELETE FROM Users`);
        console.log((0, colorConsole_1.default)('Tables have been cleared\n', 'green', 'black', 'bold'));
    }
    catch (error) {
        console.error("Error at clear tables: ", error);
    }
});
exports.clearUsersTables = clearUsersTables;

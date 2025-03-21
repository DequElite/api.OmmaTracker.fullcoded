import colorize from "../utils/colorConsole";
import { pool } from "./db";

export const createUsersTable = async () => {
    try{
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_difficulty') THEN
                    CREATE TYPE task_difficulty AS ENUM ('easy', 'medium', 'hard');
                END IF;
            END $$;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(70) NOT NULL
            )
        `)
        
        await pool.query(`
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

        await pool.query(`
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

        await pool.query(`
            CREATE TABLE IF NOT EXISTS UsersSubtasks (
                id SERIAL PRIMARY KEY,
                task_id INT NOT NULL,
                text TEXT NOT NULL,
                is_completed BOOLEAN NOT NULL DEFAULT FALSE,
                FOREIGN KEY (task_id) REFERENCES UsersTasks(id) ON DELETE CASCADE
            )
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS SuperAdmin (
                id SERIAL PRIMARY KEY,
                supername VARCHAR(50) NOT NULL UNIQUE,
                superemail VARCHAR(100) NOT NULL UNIQUE,
                superpassword VARCHAR(70) NOT NULL
            ) 
        `)

        await pool.query(`
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
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS NotificationReadStatus (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                notification_id INT NOT NULL,
                read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (notification_id) REFERENCES Notifications(id) ON DELETE CASCADE,
                UNIQUE (user_id, notification_id)  
            );

        `)

        const users = await pool.query(`SELECT * FROM Users`);
        const usersAdditional = await pool.query(`SELECT * FROM UsersAdditional`);

        // console.log(users.rows); // Печатаем результат первого запроса
        // console.log(usersAdditional.rows); 

        console.log(colorize('Table was created (if it wasn\'t) \n', 'green', 'black', 'bold'));
    } catch (error){
        console.error("Error at create table: ", error);
    }
}

export const clearUsersTables = async () => {
    try {
        await pool.query(`DELETE FROM UsersSubtasks`);
        await pool.query(`DELETE FROM UsersTasks`);
        await pool.query(`DELETE FROM UsersAdditional`);
        await pool.query(`DELETE FROM Users`);

        console.log(colorize('Tables have been cleared\n', 'green', 'black', 'bold'));
    } catch (error) {
        console.error("Error at clear tables: ", error);
    }
}

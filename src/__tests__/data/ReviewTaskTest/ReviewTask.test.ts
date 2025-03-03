// import request from "supertest";
// import  app  from "../../../index";
// import { pool } from "../../../config/db";
// import { NextFunction, Request, Response } from "express";

// describe("ReviewTask test", ()=>{
//     jest.doMock("../../../middleware/authenticateToken", () => {
//         return jest.fn((req: Request, res: Response, next: NextFunction) => {
//             console.log("authenticateToken mocked");
//             (req as any).user = { id: 1 };
//             next();
//         });
//     });

//     beforeAll(async () => {
//         await pool.query(`
//             CREATE TABLE IF NOT EXISTS UsersTasksTest (
//                 id SERIAL PRIMARY KEY,
//                 user_id INT,
//                 name VARCHAR(255)
//             )
//         `)
//     });
//     beforeEach(async ()=>{
//         await pool.query(`
//             DELETE FROM UsersTasksTest
//         `)
//     });

//     test("POST /once-task test - should return one task", async ()=>{
//         const result = await pool.query(`
//             INSERT INTO UsersTasksTest (user_id, name)
//             VALUES ($1, $2)
//             RETURNING id
//         `, [1, "Test task"]);

//         const response = await request(app)
//                                 .post("/api/data/task/review/once-task")
//                                 .send({taskid:result.rows[0].id});

//         expect(response.status).toBe(200);
//         expect(response.body).toHaveProperty("Task");
//         expect(response.body.Task.name).toBe("Test Task");
//     })

// });
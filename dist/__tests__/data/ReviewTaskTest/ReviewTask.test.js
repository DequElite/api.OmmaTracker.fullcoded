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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const db_1 = require("../../../config/db");
describe("ReviewTask test", () => {
    jest.doMock("../../../middleware/authenticateToken", () => {
        return jest.fn((req, res, next) => {
            console.log("authenticateToken mocked");
            req.user = { id: 1 };
            next();
        });
    });
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_1.pool.query(`
            CREATE TABLE IF NOT EXISTS UsersTasksTest (
                id SERIAL PRIMARY KEY,
                user_id INT,
                name VARCHAR(255)
            )
        `);
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_1.pool.query(`
            DELETE FROM UsersTasksTest
        `);
    }));
    test("POST /once-task test - should return one task", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield db_1.pool.query(`
            INSERT INTO UsersTasksTest (user_id, name)
            VALUES ($1, $2)
            RETURNING id
        `, [1, "Test task"]);
        const response = yield (0, supertest_1.default)(index_1.default)
            .post("/api/data/task/review/once-task")
            .send({ taskid: result.rows[0].id });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("Task");
        expect(response.body.Task.name).toBe("Test Task");
    }));
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./prisma/client"));
async function test() {
    const user = await client_1.default.user.create({
        data: {
            name: "Test",
            email: "test@test.com",
            password: "123"
        }
    });
    console.log(user);
}
test();

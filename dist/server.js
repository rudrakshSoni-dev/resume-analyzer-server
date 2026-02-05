"use strict";
// src/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
// import prisma from "./prisma/client";
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        // connect DB
        // await prisma.$connect();
        console.log("Database connected");
        // start server
        app_1.default.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error("Server failed to start:", err);
        process.exit(1);
    }
}
startServer();

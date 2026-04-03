"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cloudinary_1 = __importDefault(require("./config/cloudinary"));
const app_1 = __importDefault(require("./app"));
const client_1 = __importDefault(require("./prisma/client"));
const PORT = process.env.PORT || 5000;
const cloudinary_config = cloudinary_1.default.config();
console.log("Cloudinary configured:", !!cloudinary_config.cloud_name);
async function startServer() {
    try {
        await client_1.default.$connect();
        console.log("Database connected");
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use("/api/v0/", rateLimiter_1.apiLimiter); // Apply general API rate limiter to all /api/v0 routes
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.get("/", (_, res) => {
    res.json({ message: "Welcome to the ATS Analyzer API" });
});
app.get("/health", (_, res) => {
    res.json({ status: "OK", message: "ATS Analyzer API running" });
});
app.use("/api/v0/auth", auth_routes_1.default);
app.use("/api/v0/resume", require("./routes/resume.routes").default);
// app.use("/api/v0/company", require("./routes/company.routes").default);
// app.use("/api/v0/job", jobRoutes);
exports.default = app;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../prisma/client"));
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const COOKIE_NAME = "token";
function requireAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token)
        return res.sendStatus(401);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        return res.sendStatus(401);
    }
}
const protect = async (req, res, next) => {
    try {
        let token;
        // 1️⃣ Check cookie first
        if (req.cookies?.[COOKIE_NAME]) {
            token = req.cookies[COOKIE_NAME];
        }
        // 2️⃣ Check Authorization header
        else if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({
                message: "Not authorized, token missing",
            });
        }
        // 3️⃣ Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 4️⃣ Find user in DB
        const user = await client_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true },
        });
        if (!user) {
            return res.status(401).json({
                message: "User not found",
            });
        }
        // 5️⃣ Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Not authorized, invalid token",
        });
    }
};
exports.protect = protect;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// General API limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, // 100 requests/IP
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict limiter for auth (OTP abuse protection)
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 min
    max: 5, // 5 requests/IP
    message: {
        success: false,
        message: "Too many requests. Try again later.",
    },
});
// Heavy route limiter (LLM endpoint)
exports.llmLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 min
    max: 10, // max 10 analyses
    message: {
        success: false,
        message: "Too many analysis requests. Slow down.",
    },
});

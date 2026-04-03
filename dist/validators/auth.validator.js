"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailSchema = exports.verifyResetOtpSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name too short"),
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 chars"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 chars"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    otp: zod_1.z
        .string()
        .length(6, "Invalid token"),
    newPassword: zod_1.z
        .string()
        .min(6, "Password must be at least 6 chars"),
});
exports.verifyResetOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    otp: zod_1.z
        .string()
        .length(6, "Invalid OTP"),
});
exports.verifyEmailSchema = zod_1.z.object({
    email: zod_1.z.
        string().email("Invalid email"),
    otp: zod_1.z
        .string()
        .length(6, "Invalid OTP")
});

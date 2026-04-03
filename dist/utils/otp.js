"use strict";
// src/utils/otp.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.hashOtp = hashOtp;
exports.compareOtp = compareOtp;
exports.getOtpExpiry = getOtpExpiry;
exports.isOtpExpired = isOtpExpired;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate 6-digit OTP
 */
function generateOtp(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
}
/**
 * Hash OTP (for secure storage)
 */
function hashOtp(otp) {
    return crypto_1.default.createHash("sha256").update(otp).digest("hex");
}
/**
 * Compare OTP with hashed value
 */
function compareOtp(plainOtp, hashedOtp) {
    const hashedInput = hashOtp(plainOtp);
    return hashedInput === hashedOtp;
}
/**
 * Get expiry time (default: 10 minutes)
 */
function getOtpExpiry(minutes = 10) {
    return new Date(Date.now() + minutes * 60 * 1000);
}
/**
 * Check if OTP expired
 */
function isOtpExpired(expiry) {
    return expiry < new Date();
}

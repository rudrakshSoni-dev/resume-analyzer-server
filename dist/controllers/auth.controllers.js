"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.forgotPassword = forgotPassword;
exports.verifyResetOtp = verifyResetOtp;
exports.resetPassword = resetPassword;
exports.verifyEmail = verifyEmail;
const otp_1 = require("../utils/otp");
const email_1 = require("../utils/email");
const auth_service_1 = require("../services/auth.service");
const COOKIE_NAME = "token";
const SALT_ROUNDS = 10;
async function register(req, res) {
    try {
        const result = await (0, auth_service_1.registerUser)(req.body);
        const otp = (0, otp_1.generateOtp)();
        await (0, auth_service_1.saveEmailOtp)({
            email: result.email,
            otp,
        });
        (0, email_1.sendVerificationOTP)(result.email, otp);
        console.log("EMAIL OTP:", otp);
        return res.status(201).json({
            message: "User registered. Please check your inbox to verify email using OTP.",
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || "Registration failed",
        });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await (0, auth_service_1.loginUser)({ email, password });
        // optional: block unverified users
        if (!result.user.is_verified) {
            return res.status(403).json({
                message: "Please verify your email before logging in",
            });
        }
        res.cookie(COOKIE_NAME, result.token, {
            httpOnly: true,
            secure: false, // true in production
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({
            message: "Login successful",
            token: result.token,
            user: result.user,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message || "Login failed",
        });
    }
}
async function logout(req, res) {
    try {
        await (0, auth_service_1.logoutUser)(); // optional (for blacklist/session)
        res.clearCookie(COOKIE_NAME);
        return res.json({
            message: "Logged out successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Logout failed",
        });
    }
}
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const otp = await (0, auth_service_1.sendPasswordResetOtp)(email);
        await (0, email_1.sendVerificationOTP)(email, otp);
        return res.json({
            message: "OTP sent to email",
        });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
async function verifyResetOtp(req, res) {
    try {
        const { email, otp } = req.body;
        const userId = await (0, auth_service_1.verifyPasswordResetOtp)(email, otp);
        return res.json({
            message: "OTP verified",
            userId, // optional (or use temp token)
        });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword } = req.body;
        console.log("Body:", req.body);
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP and newPassword are required",
            });
        }
        const userId = await (0, auth_service_1.verifyPasswordResetOtp)(email, otp);
        await (0, auth_service_1.resetPasswordWithOtp)(userId, newPassword);
        return res.json({
            message: "Password reset successful",
        });
    }
    catch (err) {
        return res.status(400).json({
            message: err.message,
        });
    }
}
async function verifyEmail(req, res) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }
        await (0, auth_service_1.verifyEmailOtp)(email, otp);
        return res.json({
            message: "Email verified successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message || "Invalid OTP",
        });
    }
}

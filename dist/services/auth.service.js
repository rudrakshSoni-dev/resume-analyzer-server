"use strict";
// src/services/auth.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
exports.findUserByEmail = findUserByEmail;
exports.comparePassword = comparePassword;
exports.sendPasswordResetOtp = sendPasswordResetOtp;
exports.verifyPasswordResetOtp = verifyPasswordResetOtp;
exports.resetPasswordWithOtp = resetPasswordWithOtp;
exports.updatePassword = updatePassword;
exports.generateEmailVerificationOtp = generateEmailVerificationOtp;
exports.markEmailVerified = markEmailVerified;
exports.saveEmailOtp = saveEmailOtp;
exports.verifyEmailOtp = verifyEmailOtp;
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const otp_1 = require("../utils/otp");
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_MINUTES = 30;
async function registerUser(data) {
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
        throw new Error("Email already in use");
    }
    const user = await client_1.default.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            is_verified: false,
        },
    });
    return user;
}
/**
 * LOGIN
 */
async function loginUser(data) {
    const user = await findUserByEmail(data.email);
    if (!user)
        throw new Error("Invalid credentials");
    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch)
        throw new Error("Invalid credentials");
    const token = generateToken(user.id);
    return {
        token,
        user,
    };
}
/**
 * LOGOUT
 */
async function logoutUser() {
    return { message: "Logout Successful" };
}
/**
 * FIND USER
 */
async function findUserByEmail(email) {
    return client_1.default.user.findUnique({
        where: { email },
    });
}
/**
 * PASSWORD COMPARE
 */
async function comparePassword(plain, hashed) {
    return bcrypt_1.default.compare(plain, hashed);
}
/**
 * JWT TOKEN
 */
function generateToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
// export async function generateResetToken(email: string) {
//   const user = await findUserByEmail(email);
//   if (!user) throw new Error("User not found");
//   const rawToken = crypto.randomBytes(32).toString("hex");
//   const hashedToken = hashToken(rawToken);
//   const expiry = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
//   await prisma.passwordReset.upsert({
//     where: { userId: user.id },
//     update: {
//       tok: hashedToken,
//       expiresAt: expiry,
//     },
//     create: {
//       userId: user.id,
//       token: hashedToken,
//       expiresAt: expiry,
//     },
//   });
//   return rawToken;
// }
async function sendPasswordResetOtp(email) {
    const user = await findUserByEmail(email);
    if (!user)
        throw new Error("User not found");
    const otp = (0, otp_1.generateOtp)();
    const hashedOtp = (0, otp_1.hashOtp)(otp);
    const expiresAt = (0, otp_1.getOtpExpiry)();
    await client_1.default.passwordResetOtp.upsert({
        where: { userId: user.id },
        update: {
            otp: hashedOtp,
            expiresAt,
        },
        create: {
            userId: user.id,
            otp: hashedOtp,
            expiresAt,
        },
    });
    return otp; // send via email
}
async function verifyPasswordResetOtp(email, otp) {
    const user = await findUserByEmail(email);
    if (!user)
        throw new Error("User not found");
    const record = await client_1.default.passwordResetOtp.findUnique({
        where: { userId: user.id },
    });
    if (!record)
        throw new Error("OTP not found");
    if ((0, otp_1.isOtpExpired)(record.expiresAt)) {
        throw new Error("OTP expired");
    }
    const isValid = (0, otp_1.compareOtp)(otp, record.otp);
    if (!isValid)
        throw new Error("Invalid OTP");
    return user.id; // allow reset
}
async function resetPasswordWithOtp(userId, newPassword) {
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await client_1.default.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
    // cleanup OTP
    await client_1.default.passwordResetOtp.delete({
        where: { userId },
    });
}
// export async function verifyResetToken(token: string) {
//   const hashedToken = hashToken(token);
//   const record = await prisma.passwordReset.findFirst({
//     where: { token: hashedToken },
//   });
//   if (!record || record.expiresAt < new Date()) {
//     throw new Error("Invalid or expired token");
//   }
//   return record.userId;
// }
async function updatePassword(userId, newPassword) {
    await client_1.default.user.update({
        where: { id: userId },
        data: { password: newPassword },
    });
    // delete reset token after use
    await client_1.default.passwordResetOtp.deleteMany({
        where: { userId },
    });
}
async function generateEmailVerificationOtp(email) {
    const user = await findUserByEmail(email);
    if (!user)
        throw new Error("User not found");
    if (user.is_verified) {
        throw new Error("Email already verified");
    }
    const otp = (0, otp_1.generateOtp)();
    const hashedOtp = (0, otp_1.hashOtp)(otp);
    const expiresAt = (0, otp_1.getOtpExpiry)();
    await client_1.default.emailVerification.upsert({
        where: { userId: user.id },
        update: {
            otp: hashedOtp,
            expiresAt,
        },
        create: {
            userId: user.id,
            otp: hashedOtp,
            expiresAt,
        },
    });
    return otp; // send this via email
}
/**
 * VERIFY EMAIL OTP
 */
/**
 * MARK EMAIL VERIFIED
 */
async function markEmailVerified(userId) {
    await client_1.default.user.update({
        where: { id: userId },
        data: { is_verified: true },
    });
    await client_1.default.emailVerification.deleteMany({
        where: { userId },
    });
}
/**
 * TOKEN HASH (IMPORTANT FOR SECURITY)
 */
function hashToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
async function saveEmailOtp({ email, otp, }) {
    const user = await findUserByEmail(email);
    if (!user)
        throw new Error("User not found");
    const hashedOtp = (0, otp_1.hashOtp)(otp);
    const expiresAt = (0, otp_1.getOtpExpiry)();
    await client_1.default.emailVerification.upsert({
        where: { userId: user.id },
        update: {
            otp: hashedOtp,
            expiresAt,
        },
        create: {
            userId: user.id,
            otp: hashedOtp,
            expiresAt,
        },
    });
}
async function verifyEmailOtp(email, otp) {
    const user = await findUserByEmail(email);
    if (!user)
        throw new Error("User not found");
    const record = await client_1.default.emailVerification.findUnique({
        where: { userId: user.id },
    });
    if (!record)
        throw new Error("OTP not found");
    if ((0, otp_1.isOtpExpired)(record.expiresAt)) {
        throw new Error("OTP expired");
    }
    const isValid = (0, otp_1.compareOtp)(otp, record.otp);
    if (!isValid)
        throw new Error("Invalid OTP");
    // mark verified
    await client_1.default.user.update({
        where: { id: user.id },
        data: { is_verified: true },
    });
    // cleanup
    await client_1.default.emailVerification.delete({
        where: { userId: user.id },
    });
}

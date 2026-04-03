"use strict";
// src/utils/email.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationOTP = sendVerificationOTP;
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail", // simpler than host/port
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
async function sendVerificationOTP(email, otp) {
    await transporter.sendMail({
        from: `"Auth System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your Email",
        html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    `,
    });
}
async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: `"ATS Analyzer" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || `<p>${text}</p>`,
        });
        console.log("EMAIL SENT:", info.messageId);
        return info;
    }
    catch (error) {
        console.error("EMAIL ERROR:", error);
        throw new Error("Failed to send email");
    }
}

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";

import {
  registerUser,
  loginUser,
  logoutUser,
  findUserByEmail,
  generateResetToken,
  verifyResetToken,
  updatePassword,
  generateEmailVerificationToken,
  verifyEmailToken,
  markEmailVerified,
} from "../services/auth.service";

import { sendEmail } from "../utils/email";

const COOKIE_NAME = "token";
const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  try {
    const result = await registerUser(req.body);

    const verificationToken = await generateEmailVerificationToken(result.email);

    const verifyLink = `http://localhost:5000/api/v0/auth/verify-email?token=${verificationToken}`;

    await sendEmail(
      result.email, // send to actual user
      "Verify your email",
      `Click to verify: ${verifyLink}`
    );

    console.log("VERIFY TOKEN:", verificationToken);

    return res.status(201).json({
      message: "User registered. Please verify your email.",
      user: result.user,
      verificationToken,
      verifyLink,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

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
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Login failed",
    });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    await logoutUser(); // optional (for blacklist/session)
    res.clearCookie(COOKIE_NAME);
    return res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    // don't reveal user existence
    if (!user) {
      return res.json({ message: "If account exists, reset link sent" });
    }
    const token = await generateResetToken(email);
    const resetLink = `http://localhost:5000/api/v0/auth/reset-password?token=${token}`;
    await sendEmail(
      "mrrssoni12@gmail.com",
      "Reset Password",
      `Click to reset: ${resetLink}`
    );

    return res.json({
      message: "If account exists, reset link sent",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to process request",
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    const userId = await verifyResetToken(token);

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await updatePassword(userId, hashedPassword);

    return res.json({
      message: "Password updated successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Invalid or expired token",
    });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.body;

    const userId = await verifyEmailToken(token);

    await markEmailVerified(userId);

    return res.json({
      message: "Email verified successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Invalid verification token",
    });
  }
}
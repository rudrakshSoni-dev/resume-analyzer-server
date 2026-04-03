import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {generateOtp} from "../utils/otp";
import { sendVerificationOTP } from "../utils/email";

import {
  registerUser,
  loginUser,
  logoutUser,
  findUserByEmail,
  generateResetToken,
  updatePassword,
  generateEmailVerificationOtp,
  verifyEmailOtp,
  markEmailVerified,
  saveEmailOtp,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
} from "../services/auth.service";

import { sendEmail } from "../utils/email";

const COOKIE_NAME = "token";
const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  try {
    const result = await registerUser(req.body);

    const otp = generateOtp();

    await saveEmailOtp({
      email: result.email,
      otp,
    });
    sendVerificationOTP(result.email, otp);
    console.log("EMAIL OTP:", otp);

    return res.status(201).json({
      message: "User registered. Please check your inbox to verify email using OTP.",
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

    const otp = await sendPasswordResetOtp(email);

    await sendVerificationOTP(email, otp);

    return res.json({
      message: "OTP sent to email",
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

export async function verifyResetOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    const userId = await verifyPasswordResetOtp(email, otp);

    return res.json({
      message: "OTP verified",
      userId, // optional (or use temp token)
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, otp, newPassword } = req.body;
    console.log("Body:", req.body);

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and newPassword are required",
      });
    }

    const userId = await verifyPasswordResetOtp(email, otp);

    await resetPasswordWithOtp(userId, newPassword);

    return res.json({
      message: "Password reset successful",
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    await verifyEmailOtp(email, otp);

    return res.json({
      message: "Email verified successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Invalid OTP",
    });
  }
}



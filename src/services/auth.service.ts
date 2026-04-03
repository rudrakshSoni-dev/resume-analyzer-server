// src/services/auth.service.ts

import prisma from "../prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateOtp, hashOtp, getOtpExpiry, isOtpExpired, compareOtp } from "../utils/otp";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_MINUTES = 30;

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const user = await prisma.user.create({
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
export async function loginUser(data: LoginData) {
  const user = await findUserByEmail(data.email);

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await comparePassword(data.password, user.password);

  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken(user.id);

  return {
    token,
    user,
  };
}

/**
 * LOGOUT
 */
export async function logoutUser() {
  return { message: "Logout Successful" };
}

/**
 * FIND USER
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * PASSWORD COMPARE
 */
export async function comparePassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

/**
 * JWT TOKEN
 */
function generateToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
}

export async function generateResetToken(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);

  const expiry = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  await prisma.passwordReset.upsert({
    where: { userId: user.id },
    update: {
      token: hashedToken,
      expiresAt: expiry,
    },
    create: {
      userId: user.id,
      token: hashedToken,
      expiresAt: expiry,
    },
  });

  return rawToken;
}

export async function verifyResetToken(token: string) {
  const hashedToken = hashToken(token);

  const record = await prisma.passwordReset.findFirst({
    where: { token: hashedToken },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new Error("Invalid or expired token");
  }

  return record.userId;
}

export async function updatePassword(userId: string, newPassword: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { password: newPassword },
  });

  // delete reset token after use
  await prisma.passwordReset.deleteMany({
    where: { userId },
  });
}

export async function generateEmailVerificationOtp(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  if (user.is_verified) {
    throw new Error("Email already verified");
  }

  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);
  const expiresAt = getOtpExpiry();

  await prisma.emailVerification.upsert({
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
export async function markEmailVerified(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { is_verified: true },
  });

  await prisma.emailVerification.deleteMany({
    where: { userId },
  });
}

/**
 * TOKEN HASH (IMPORTANT FOR SECURITY)
 */
function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function saveEmailOtp({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const hashedOtp = hashOtp(otp);
  const expiresAt = getOtpExpiry();

  await prisma.emailVerification.upsert({
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

export async function verifyEmailOtp(email: string, otp: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const record = await prisma.emailVerification.findUnique({
    where: { userId: user.id },
  });

  if (!record) throw new Error("OTP not found");

  if (isOtpExpired(record.expiresAt)) {
    throw new Error("OTP expired");
  }

  const isValid = compareOtp(otp, record.otp);

  if (!isValid) throw new Error("Invalid OTP");

  // mark verified
  await prisma.user.update({
    where: { id: user.id },
    data: { is_verified: true },
  });

  // cleanup
  await prisma.emailVerification.delete({
    where: { userId: user.id },
  });
}
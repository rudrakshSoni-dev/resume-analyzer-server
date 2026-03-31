// src/services/auth.service.ts

import prisma from "../prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

/**
 * REGISTER
 */
export async function registerUser(data: RegisterData) {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      is_verified: false,
    },
  });

  const token = generateToken(user.id);

  return {
    token,
    email: user.email,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
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

export async function generateEmailVerificationToken(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);

  console.log("RAW TOKEN:", rawToken);
console.log("HASHED TOKEN:", hashedToken);

  await prisma.emailVerification.upsert({
    where: { userId: user.id },
    update: { token: hashedToken },
    create: {
      userId: user.id,
      token: hashedToken,
    },
  });

  return rawToken;
}

/**
 * VERIFY EMAIL TOKEN
 */
export async function verifyEmailToken(token: string) {
  const hashedToken = hashToken(token);
  console.log("VERIFY EMAIL ROUTE HIT");
  
  console.log("INCOMING TOKEN:", token);

const hashed = hashToken(token);
console.log("HASHED INCOMING:", hashed);

const record = await prisma.emailVerification.findFirst({
  where: { token: hashed },
});

console.log("DB RECORD:", record);

  if (!record) throw new Error("Invalid token");

  return record.userId;
}

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
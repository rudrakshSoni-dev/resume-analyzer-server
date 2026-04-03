// src/utils/otp.ts

import crypto from "crypto";

/**
 * Generate 6-digit OTP
 */
export function generateOtp(length: number = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Hash OTP (for secure storage)
 */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Compare OTP with hashed value
 */
export function compareOtp(plainOtp: string, hashedOtp: string): boolean {
  const hashedInput = hashOtp(plainOtp);
  return hashedInput === hashedOtp;
}

/**
 * Get expiry time (default: 10 minutes)
 */
export function getOtpExpiry(minutes: number = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if OTP expired
 */
export function isOtpExpired(expiry: Date): boolean {
  return expiry < new Date();
}
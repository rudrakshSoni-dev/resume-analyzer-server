import rateLimit from "express-rate-limit";

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests/IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth (OTP abuse protection)
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 12, // 12 requests/IP
  message: {
    success: false,
    message: "Too many requests. Try again later.",
  },
});

// Heavy route limiter (LLM endpoint)
export const llmLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 10, // max 10 analyses
  message: {
    success: false,
    message: "Too many analysis requests. Slow down.",
  },
});
import { Router } from "express";
import { 
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
 } from "../controllers/auth.controllers";
import { validate } from "../middleware/validate.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validator";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", requireAuth, logout);
router.post("/health",(req,res)=>{
  res.json({ message: "auth route is healthy" });
});
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

export default router;

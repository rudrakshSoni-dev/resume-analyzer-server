import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controllers";
import { validate } from "../middleware/validate.middleware";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", requireAuth, logout);
router.post("/health",(req,res)=>{
  res.json({ message: "auth route is healthy" });
});

export default router;

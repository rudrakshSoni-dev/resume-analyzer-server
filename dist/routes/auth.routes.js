"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = require("../controllers/auth.controllers");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/register", (0, validate_middleware_1.validate)(auth_validator_1.registerSchema), auth_controllers_1.register);
router.post("/login", (0, validate_middleware_1.validate)(auth_validator_1.loginSchema), auth_controllers_1.login);
router.post("/logout", auth_middleware_1.requireAuth, auth_controllers_1.logout);
router.post("/health", (req, res) => {
    res.json({ message: "auth route is healthy" });
});
router.post("/forgot-password", (0, validate_middleware_1.validate)(auth_validator_1.forgotPasswordSchema), auth_controllers_1.forgotPassword);
router.post("/verify-reset-otp", (0, validate_middleware_1.validate)(auth_validator_1.verifyResetOtpSchema), auth_controllers_1.verifyResetOtp);
router.post("/reset-password", (0, validate_middleware_1.validate)(auth_validator_1.resetPasswordSchema), auth_controllers_1.resetPassword);
router.post("/verify-email", (0, validate_middleware_1.validate)(auth_validator_1.verifyEmailSchema), auth_controllers_1.verifyEmail);
exports.default = router;

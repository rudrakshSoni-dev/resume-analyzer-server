"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resume_controller_1 = require("../controllers/resume.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = __importDefault(require("../middleware/upload.middleware"));
const validate_middleware_1 = require("../middleware/validate.middleware");
const resume_validator_1 = require("../validators/resume.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.post("/upload", upload_middleware_1.default.single("resume"), resume_validator_1.validateUploadResume, validate_middleware_1.handleValidationErrors, resume_controller_1.resumeController.uploadResume);
router.get("/", resume_controller_1.resumeController.getUserResumes);
router.get("/:id", resume_validator_1.validateResumeId, validate_middleware_1.handleValidationErrors, resume_controller_1.resumeController.getResumeById);
router.delete("/:id", resume_validator_1.validateResumeId, validate_middleware_1.handleValidationErrors, resume_controller_1.resumeController.deleteResume);
router.post("/:id/analyze", resume_validator_1.validateAnalyzeResume, validate_middleware_1.handleValidationErrors, resume_controller_1.resumeController.analyzeResume);
exports.default = router;

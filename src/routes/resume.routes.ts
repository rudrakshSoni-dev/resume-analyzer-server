import { Router } from "express";
import { resumeController } from "../controllers/resume.controller";
import { protect } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";
import { handleValidationErrors } from "../middleware/validate.middleware";
import {
  validateUploadResume,
  validateResumeId,
  validateAnalyzeResume,
} from "../validators/resume.validator";

const router = Router();

router.use(protect);

router.post(
  "/upload",
  upload.single("resume"),
  validateUploadResume,
  handleValidationErrors,
  resumeController.uploadResume,
);

router.get("/", resumeController.getUserResumes);

router.get(
  "/:id",
  validateResumeId,
  handleValidationErrors,
  resumeController.getResumeById,
);

router.delete(
  "/:id",
  validateResumeId,
  handleValidationErrors,
  resumeController.deleteResume,
);

router.post(
  "/:id/analyze",
  validateAnalyzeResume,
  handleValidationErrors,
  resumeController.analyzeResume,
);

export default router;

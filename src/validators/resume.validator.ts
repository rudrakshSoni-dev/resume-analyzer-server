import { body, param } from "express-validator";

export const validateUploadResume = [
  (req: any, res: any, next: any) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }
//C:\Users\BIT\Downloads\Resume-Sayantan.pdf
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Only PDF and DOCX files are allowed",
      });
    }

    next();
  },
];

export const validateResumeId = [
  param("id")
    .isUUID()
    .withMessage("Invalid resume ID format"),
];

export const validateAnalyzeResume = [
  param("id")
    .isUUID()
    .withMessage("Invalid resume ID format"),

  body("jobDescription")
    .optional()
    .isString()
    .withMessage("Job description must be a string")
    .isLength({ min: 10 })
    .withMessage("Job description must be at least 10 characters long"),
];

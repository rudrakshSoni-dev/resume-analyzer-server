"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAnalyzeResume = exports.validateResumeId = exports.validateUploadResume = void 0;
const express_validator_1 = require("express-validator");
exports.validateUploadResume = [
    (req, res, next) => {
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
exports.validateResumeId = [
    (0, express_validator_1.param)("id")
        .isUUID()
        .withMessage("Invalid resume ID format"),
];
exports.validateAnalyzeResume = [
    (0, express_validator_1.param)("id")
        .isUUID()
        .withMessage("Invalid resume ID format"),
    (0, express_validator_1.body)("jobDescription")
        .optional()
        .isString()
        .withMessage("Job description must be a string")
        .isLength({ min: 10 })
        .withMessage("Job description must be at least 10 characters long"),
];

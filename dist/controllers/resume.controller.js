"use strict";
// controllers/resume.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeController = exports.analyzeResume = exports.deleteResume = exports.getResumeById = exports.getUserResumes = exports.uploadResume = void 0;
const resume_service_1 = require("../services/resume.service");
const cloudinary_service_1 = require("../services/cloudinary.service");
const ats_service_1 = require("../services/ats/ats.service");
const client_1 = __importDefault(require("../prisma/client"));
const uploadResume = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Not authorized" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "Resume file required" });
        }
        const fileUrl = await (0, cloudinary_service_1.uploadToCloudinary)(req.file);
        const resume = await resume_service_1.resumeService.createResume(req.user.id, fileUrl, req.file);
        return res.status(201).json(resume);
    }
    catch (error) {
        return res.status(500).json({
            message: "Upload failed",
            error: error.message,
        });
    }
};
exports.uploadResume = uploadResume;
const getUserResumes = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const resumes = await resume_service_1.resumeService.getUserResumes(req.user.id);
        return res.json(resumes);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch resumes",
            error: error.message,
        });
    }
};
exports.getUserResumes = getUserResumes;
const getResumeById = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const resume = await resume_service_1.resumeService.getResumeById(req.user.id, req.params.id);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        return res.json(resume);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch resume",
            error: error.message,
        });
    }
};
exports.getResumeById = getResumeById;
const deleteResume = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const deleted = await resume_service_1.resumeService.deleteResume(req.user.id, req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Resume not found" });
        }
        return res.json({ message: "Resume deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({
            message: "Delete failed",
            error: error.message,
        });
    }
};
exports.deleteResume = deleteResume;
const analyzeResume = async (req, res) => {
    try {
        const userId = req.user?.id;
        const id = req.params.id;
        const jobDescription = req.body.jobDescription ?? "";
        const resume = await client_1.default.resume.findFirst({
            where: { id, userId },
        });
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        const resumeText = resume.parsedText || "";
        const result = await ats_service_1.atsService.analyze(resumeText, jobDescription);
        const analysis = await client_1.default.analysis.create({
            data: {
                resumeId: resume.id,
                atsScore: result.finalATSScore,
                keywordScore: result.deterministic.keywordScore,
                sectionScore: result.deterministic.sectionScore,
                skillScore: result.deterministic.skillScore,
                structureScore: result.deterministic.structureScore,
                semanticScore: result.semantic.score,
                experienceScore: result.experienceQuality.score,
                impactScore: result.experienceQuality.impactScore,
                suggestions: result.suggestions,
            },
        });
        return res.json({
            message: "Resume analyzed successfully",
            analysis,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Analysis failed",
            error: error.message,
        });
    }
};
exports.analyzeResume = analyzeResume;
exports.resumeController = {
    uploadResume: exports.uploadResume,
    getUserResumes: exports.getUserResumes,
    getResumeById: exports.getResumeById,
    deleteResume: exports.deleteResume,
    analyzeResume: exports.analyzeResume,
};

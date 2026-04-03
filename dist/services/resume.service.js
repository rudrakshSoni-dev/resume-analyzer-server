"use strict";
// services/resume.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const documentParser_service_1 = require("./parser/documentParser.service");
const toWords = (text) => text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
const clampScore = (score) => Math.max(0, Math.min(100, Number(score.toFixed(2))));
exports.resumeService = {
    async createResume(userId, fileUrl, file) {
        const parsedText = await documentParser_service_1.documentParserService.parseFile(file);
        return client_1.default.resume.create({
            data: {
                userId,
                fileUrl,
                mimetype: file.mimetype,
                parsedText,
            },
        });
    },
    async getUserResumes(userId) {
        return client_1.default.resume.findMany({
            where: { userId },
            include: { analyses: true },
            orderBy: { createdAt: "desc" },
        });
    },
    async getResumeById(userId, id) {
        return client_1.default.resume.findFirst({
            where: { id, userId },
            include: { analyses: true },
        });
    },
    async deleteResume(userId, id) {
        const resume = await client_1.default.resume.findFirst({
            where: { id, userId },
        });
        if (!resume)
            return null;
        await client_1.default.$transaction([
            client_1.default.analysis.deleteMany({ where: { resumeId: id } }),
            client_1.default.resume.delete({ where: { id } }),
        ]);
        return true;
    },
    async analyzeResume(userId, id, jobDescription) {
        const resume = await client_1.default.resume.findFirst({
            where: { id, userId },
        });
        if (!resume)
            return null;
        // Fetch the file from the URL
        const response = await fetch(resume.fileUrl);
        const fileBuffer = await response.arrayBuffer();
        const parsedText = await documentParser_service_1.documentParserService.parseFile({
            buffer: Buffer.from(fileBuffer),
            mimetype: resume.fileUrl.endsWith(".pdf")
                ? "application/pdf"
                : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fieldname: "resume",
            originalname: resume.fileUrl.split("/").pop() || "resume",
            encoding: "7bit",
            size: fileBuffer.byteLength,
            destination: "",
            filename: "",
            path: "",
        });
        const resumeText = parsedText || "";
        const resumeWords = toWords(resumeText);
        const jdWords = toWords(jobDescription);
        const uniqueResumeWords = new Set(resumeWords);
        const uniqueJdWords = [...new Set(jdWords)].filter((w) => w.length > 2);
        const matchedKeywords = uniqueJdWords.filter((word) => uniqueResumeWords.has(word));
        const keywordScore = uniqueJdWords.length > 0
            ? (matchedKeywords.length / uniqueJdWords.length) * 100
            : 50;
        const sectionScore = /experience|education|skills|projects/i.test(resumeText)
            ? 80
            : 50;
        const skillScore = /skills/i.test(resumeText) ? 75 : 55;
        const readabilityScore = resumeWords.length > 200 ? 82 : 65;
        const grammarScore = 70;
        const formatScore = resume.fileUrl.endsWith(".pdf") ? 85 : 70;
        const suggestions = {
            missingKeywords: uniqueJdWords.filter((word) => !uniqueResumeWords.has(word)),
            improvements: [
                "Add measurable achievements.",
                "Tailor resume to job description.",
                "Use action verbs.",
            ],
        };
        const analysis = await client_1.default.analysis.create({
            data: {
                resumeId: resume.id,
                // ✅ REQUIRED fields (you were missing these earlier)
                atsScore: 0,
                structureScore: 0,
                semanticScore: 0,
                experienceScore: 0,
                impactScore: 0,
                keywordScore: clampScore(keywordScore),
                sectionScore: clampScore(sectionScore),
                skillScore: clampScore(skillScore),
                // 🔴 MATCH YOUR SCHEMA (typos!)
                readabilityScore: clampScore(readabilityScore),
                grammarScore: clampScore(grammarScore),
                formatScore: clampScore(formatScore),
                suggestions: suggestions,
            },
        });
        const atsScore = clampScore((analysis.keywordScore +
            analysis.sectionScore +
            analysis.skillScore +
            (analysis.readabilityScore ?? 0) +
            (analysis.grammarScore ?? 0) +
            (analysis.formatScore ?? 0)) /
            6);
        await client_1.default.resume.update({
            where: { id: resume.id },
            data: { atsScore },
        });
        return { atsScore, analysis };
    },
};

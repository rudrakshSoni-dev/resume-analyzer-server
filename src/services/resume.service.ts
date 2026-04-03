// services/resume.service.ts

import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";
import { uploadToCloudinary } from "./cloudinary.service";
import { documentParserService } from "./parser/documentParser.service";

const toWords = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const clampScore = (score: number): number =>
  Math.max(0, Math.min(100, Number(score.toFixed(2))));

export const resumeService = {
async createResume(
  userId: string,
  fileUrl: string,
  file: Express.Multer.File
) {
  const parsedText = await documentParserService.parseFile(file);

  return prisma.resume.create({
    data: {
      userId,
      fileUrl,
      mimetype: file.mimetype,
      parsedText,
    },
  });
},

  async getUserResumes(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      include: { analyses: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getResumeById(userId: string, id: string) {
    return prisma.resume.findFirst({
      where: { id, userId },
      include: { analyses: true },
    });
  },

  async deleteResume(userId: string, id: string) {
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) return null;

    await prisma.$transaction([
      prisma.analysis.deleteMany({ where: { resumeId: id } }),
      prisma.resume.delete({ where: { id } }),
    ]);

    return true;
  },

  async analyzeResume(userId: string, id: string, jobDescription: string) {
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) return null;

    // Fetch the file from the URL
    const response = await fetch(resume.fileUrl);
    const fileBuffer = await response.arrayBuffer();

    const parsedText = await documentParserService.parseFile({
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
    } as Express.Multer.File);

    const resumeText = parsedText || "";
    const resumeWords = toWords(resumeText);
    const jdWords = toWords(jobDescription);

    const uniqueResumeWords = new Set(resumeWords);
    const uniqueJdWords = [...new Set(jdWords)].filter((w) => w.length > 2);

    const matchedKeywords = uniqueJdWords.filter((word) =>
      uniqueResumeWords.has(word)
    );

    const keywordScore =
      uniqueJdWords.length > 0
        ? (matchedKeywords.length / uniqueJdWords.length) * 100
        : 50;

    const sectionScore = /experience|education|skills|projects/i.test(
      resumeText
    )
      ? 80
      : 50;

    const skillScore = /skills/i.test(resumeText) ? 75 : 55;
    const readabilityScore = resumeWords.length > 200 ? 82 : 65;
    const grammarScore = 70;
    const formatScore = resume.fileUrl.endsWith(".pdf") ? 85 : 70;

    const suggestions = {
      missingKeywords: uniqueJdWords.filter(
        (word) => !uniqueResumeWords.has(word)
      ),
      improvements: [
        "Add measurable achievements.",
        "Tailor resume to job description.",
        "Use action verbs.",
      ],
    };

const analysis = await prisma.analysis.create({
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

    suggestions: suggestions as unknown as Prisma.JsonObject,
  },
});

    const atsScore = clampScore(
      (analysis.keywordScore +
        analysis.sectionScore +
        analysis.skillScore +
        (analysis.readabilityScore ?? 0) +
        (analysis.grammarScore ?? 0) +
        (analysis.formatScore ?? 0)) /
        6
    );

    await prisma.resume.update({
      where: { id: resume.id },
      data: { atsScore },
    });

    return { atsScore, analysis };
  },
};
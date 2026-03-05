// controllers/resume.controller.ts

import { Request, Response } from "express";
import { resumeService } from "../services/resume.service";
import { uploadToCloudinary } from "../services/cloudinary.service";
import { atsService } from "../services/ats/ats.service";
import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";


interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  file?: Express.Multer.File;
}

export const uploadResume = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resume file required" });
    }

    const fileUrl = await uploadToCloudinary(req.file);

    const resume = await resumeService.createResume(
      req.user.id,
      fileUrl,
      req.file,
    );

    return res.status(201).json(resume);
  } catch (error: any) {
    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
};

export const getUserResumes = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const resumes = await resumeService.getUserResumes(req.user.id);

    return res.json(resumes);
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch resumes",
      error: error.message,
    });
  }
};

export const getResumeById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const resume = await resumeService.getResumeById(
      req.user.id,
      req.params.id as string,
    );

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.json(resume);
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch resume",
      error: error.message,
    });
  }
};

export const deleteResume = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const deleted = await resumeService.deleteResume(
      req.user.id,
      req.params.id as string,
    );

    if (!deleted) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.json({ message: "Resume deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};

export const analyzeResume = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;
    const jobDescription = req.body.jobDescription ?? "";

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const resumeText = resume.parsedText || "";

    const result = await atsService.analyze(resumeText, jobDescription);

    const analysis = await prisma.analysis.create({
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

        suggestions: result.suggestions as Prisma.JsonObject,
      },
    });

    return res.json({
      message: "Resume analyzed successfully",
      analysis,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Analysis failed",
      error: error.message,
    });
  }
};

export const resumeController = {
  uploadResume,
  getUserResumes,
  getResumeById,
  deleteResume,
  analyzeResume,
};

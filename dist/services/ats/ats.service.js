"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atsService = void 0;
const deterministic_service_1 = require("./deterministic.service");
const localLLM_service_1 = require("../ai/localLLM.service");
const cloudLLM_service_1 = require("../ai/cloudLLM.service");
const clamp = (num) => Math.max(0, Math.min(100, Number(num.toFixed(2))));
exports.atsService = {
    async analyze(resumeText, jobDescription) {
        const deterministic = deterministic_service_1.deterministicService.analyze(resumeText, jobDescription);
        // ✅ Explicit typing fixes inference issues
        let semantic = { score: 0 };
        let experienceQuality = {
            score: 0,
            impactScore: 0,
        };
        let suggestions = {
            suggestions: [],
            rewriteTips: [],
            missingKeywords: [],
        };
        try {
            semantic = await localLLM_service_1.localLLMService.semanticAlignment(resumeText, jobDescription);
        }
        catch {
            console.warn("Semantic alignment failed");
        }
        try {
            experienceQuality =
                await cloudLLM_service_1.cloudLLMService.analyzeExperienceQuality(resumeText);
            suggestions =
                await cloudLLM_service_1.cloudLLMService.generateImprovementSuggestions(resumeText, jobDescription);
        }
        catch {
            console.warn("Cloud LLM failed");
        }
        const finalScore = clamp(deterministic.keywordScore * 0.2 +
            deterministic.sectionScore * 0.1 +
            deterministic.skillScore * 0.1 +
            deterministic.structureScore * 0.1 +
            semantic.score * 0.2 +
            experienceQuality.score * 0.15 +
            experienceQuality.impactScore * 0.15);
        return {
            finalATSScore: finalScore,
            deterministic,
            semantic,
            experienceQuality,
            suggestions,
        };
    },
};

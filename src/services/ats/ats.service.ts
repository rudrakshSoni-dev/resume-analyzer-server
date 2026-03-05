import { deterministicService } from "./deterministic.service";
import { localLLMService } from "../ai/localLLM.service";
import { cloudLLMService } from "../ai/cloudLLM.service";

import {
  ATSAnalysisResult,
  SemanticResult,
  ExperienceQualityResult,
  ImprovementSuggestionsResult,
} from "../../types/ats.types";

const clamp = (num: number) =>
  Math.max(0, Math.min(100, Number(num.toFixed(2))));

export const atsService = {
  async analyze(
    resumeText: string,
    jobDescription: string
  ): Promise<ATSAnalysisResult> {

    const deterministic =
      deterministicService.analyze(resumeText, jobDescription);

    // ✅ Explicit typing fixes inference issues
    let semantic: SemanticResult = { score: 0 };

    let experienceQuality: ExperienceQualityResult = {
      score: 0,
      impactScore: 0,
    };

    let suggestions: ImprovementSuggestionsResult = {
      suggestions: [],
      rewriteTips: [],
      missingKeywords: [],
    };

    try {
      semantic = await localLLMService.semanticAlignment(
        resumeText,
        jobDescription
      );
    } catch {
      console.warn("Semantic alignment failed");
    }

    try {
      experienceQuality =
        await cloudLLMService.analyzeExperienceQuality(resumeText);

      suggestions =
        await cloudLLMService.generateImprovementSuggestions(
          resumeText,
          jobDescription
        );
    } catch {
      console.warn("Cloud LLM failed");
    }

    const finalScore = clamp(
      deterministic.keywordScore * 0.2 +
      deterministic.sectionScore * 0.1 +
      deterministic.skillScore * 0.1 +
      deterministic.structureScore * 0.1 +
      semantic.score * 0.2 +
      experienceQuality.score * 0.15 +
      experienceQuality.impactScore * 0.15
    );

    return {
      finalATSScore: finalScore,
      deterministic,
      semantic,
      experienceQuality,
      suggestions,
    };
  },
};
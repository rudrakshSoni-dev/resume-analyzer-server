
export interface SemanticResult {
  score: number; // 0–100
}

export interface ExperienceQualityResult {
  score: number; // overall quality
  impactScore: number; // measurable achievements strength
}

export interface ImprovementSuggestionsResult {
  suggestions: string[];
  rewriteTips: string[];
  missingKeywords?: string[];
}

export interface DeterministicResult {
  keywordScore: number;
  sectionScore: number;
  skillScore: number;
  structureScore: number;
}

export interface ATSAnalysisResult {
  finalATSScore: number;
  deterministic: DeterministicResult;
  semantic: SemanticResult;
  experienceQuality: ExperienceQualityResult;
  suggestions: ImprovementSuggestionsResult;
}

export interface ImprovementSuggestion {
  type: "keyword" | "section" | "skill" | "structure" | "semantic" | "experience";
  message: string;
  details?: string;
}


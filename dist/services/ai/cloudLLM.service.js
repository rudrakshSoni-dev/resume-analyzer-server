"use strict";
// services/ai/cloudLLM.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudLLMService = void 0;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.HF_TOKEN,
    baseURL: "https://router.huggingface.co/v1",
});
const MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct:novita";
const safeJSONParse = (text, fallback) => {
    try {
        return JSON.parse(text);
    }
    catch {
        return fallback;
    }
};
exports.cloudLLMService = {
    async generateImprovementSuggestions(resumeText, jobDescription) {
        const prompt = `
You are an expert ATS Resume Optimization Coach.

Return ONLY valid JSON.

{
  "suggestions": string[],
  "rewriteTips": string[],
  "missingKeywords": string[]
}

Rules:
- Max 8 suggestions
- Max 6 rewriteTips
- Max 15 missingKeywords
- Each item under 25 words
- No explanations
- No extra text

Job Description:
${jobDescription}

Resume:
${resumeText}
`;
        try {
            const completion = await openai.chat.completions.create({
                model: MODEL_NAME,
                temperature: 0.2,
                top_p: 0.9,
                max_tokens: 800,
                messages: [
                    {
                        role: "system",
                        content: "You output strictly valid JSON. No markdown. No explanation."
                    },
                    { role: "user", content: prompt }
                ],
            });
            const content = completion.choices[0].message.content ?? "{}";
            return safeJSONParse(content, {
                suggestions: [],
                rewriteTips: [],
                missingKeywords: []
            });
        }
        catch (error) {
            console.error("HF suggestion generation failed:", error);
            return {
                suggestions: [],
                rewriteTips: [],
                missingKeywords: []
            };
        }
    },
    async analyzeExperienceQuality(resumeText) {
        const prompt = `
You are an ATS resume evaluator.

Return ONLY valid JSON:

{
  "score": number,
  "impactScore": number
}

Rules:
- score: overall experience strength (0-100)
- impactScore: measurable impact quality (0-100)
- No explanation
- No extra text

Resume:
${resumeText}
`;
        try {
            const completion = await openai.chat.completions.create({
                model: MODEL_NAME,
                temperature: 0.15,
                top_p: 0.9,
                max_tokens: 300,
                messages: [
                    {
                        role: "system",
                        content: "Return strictly valid JSON only."
                    },
                    { role: "user", content: prompt }
                ],
            });
            const content = completion.choices[0].message.content ?? "{}";
            return safeJSONParse(content, { score: 0, impactScore: 0 });
        }
        catch (error) {
            console.error("HF experience analysis failed:", error);
            return { score: 0, impactScore: 0 };
        }
    }
};

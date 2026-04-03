"use strict";
// services/ai/localLLM.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localLLMService = void 0;
const axios_1 = __importDefault(require("axios"));
const OLLAMA_URL = process.env.OLLAMA_URL ||
    "http://host.docker.internal:11434/api/generate";
const MODEL_NAME = "phi3"; // or "phi3:mini"
const safeJSONParse = (text, fallback) => {
    try {
        return JSON.parse(text);
    }
    catch {
        return fallback;
    }
};
const cleanJSON = (text) => {
    return text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
};
exports.localLLMService = {
    async semanticAlignment(resumeText, jd) {
        const prompt = `
You are an ATS semantic evaluator.

Compare the resume with the job description.

Return ONLY valid JSON:

{
  "score": number
}

Rules:
- score must be between 0 and 100
- 100 = perfect semantic match
- 0 = no relevance
- Be strict
- No explanation
- No extra text

Job Description:
${jd}

Resume:
${resumeText}
`;
        try {
            const response = await axios_1.default.post(OLLAMA_URL, {
                model: MODEL_NAME,
                prompt,
                stream: false,
                options: {
                    temperature: 0.1,
                    top_p: 0.9,
                }
            }, {
                timeout: 60000
            });
            const raw = response.data.response ?? "{}";
            const cleaned = cleanJSON(raw);
            return safeJSONParse(cleaned, { score: 0 });
        }
        catch (error) {
            console.error("Local semantic alignment failed:", error);
            return { score: 0 };
        }
    }
};

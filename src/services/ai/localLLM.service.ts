// services/ai/localLLM.service.ts

import axios from "axios";
import { SemanticResult } from "../../types/ats.types";

const OLLAMA_URL =
  process.env.OLLAMA_URL ||
  "http://host.docker.internal:11434/api/generate";

const MODEL_NAME = "phi3:mini"; // or "phi3:mini"

const safeJSONParse = <T>(text: string, fallback: T): T => {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};

const cleanJSON = (text: string) => {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

export const localLLMService = {

  async semanticAlignment(
    resumeText: string,
    jd: string
  ): Promise<SemanticResult> {

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
      const response = await axios.post(OLLAMA_URL, {
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

      return safeJSONParse<SemanticResult>(
        cleaned,
        { score: 0 }
      );

    } catch (error) {
      console.error("Local semantic alignment failed:", error);
      return { score: 0 };
    }
  }

};
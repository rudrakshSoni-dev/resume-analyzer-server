// services/ai/localLLM.service.ts

import axios from "axios";
import PQueue from "p-queue";
import { SemanticResult } from "../../types/ats.types";

// -----------------------------
// Config
// -----------------------------
const OLLAMA_URL =
  process.env.OLLAMA_URL ||
  "http://ollama:11434/api/generate";

const MODEL_NAME = "phi3:mini";

// -----------------------------
// Queue (CRITICAL)
// -----------------------------
const llmQueue = new PQueue({
  concurrency: 1, // prevent RAM crash
});

// Optional overload protection
const MAX_QUEUE_SIZE = 10;

// -----------------------------
// Helpers
// -----------------------------
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

// -----------------------------
// Service
// -----------------------------
export const localLLMService = {
  async semanticAlignment(
    resumeText: string,
    jd: string
  ): Promise<SemanticResult> {
    // 🚨 Reject if overloaded
    if (llmQueue.size > MAX_QUEUE_SIZE) {
      console.warn("LLM queue overloaded");
      throw new Error("Server busy. Try again later.");
    }

    return llmQueue.add(async () => {
      console.log("LLM QUEUE:", {
        waiting: llmQueue.size,
        active: llmQueue.pending,
      });

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

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 30000); // 30s timeout

      try {
        const response = await axios.post(
          OLLAMA_URL,
          {
            model: MODEL_NAME,
            prompt,
            stream: false,
            options: {
              temperature: 0.1,
              top_p: 0.9,
            },
          },
          {
            signal: controller.signal,
          }
        );

        const raw = response.data?.response ?? "{}";
        const cleaned = cleanJSON(raw);

        return safeJSONParse<SemanticResult>(
          cleaned,
          { score: 0 }
        );

      } catch (error: any) {
        if (error.name === "CanceledError") {
          console.error("LLM TIMEOUT");
        } else {
          console.error("LLM ERROR:", error?.message || error);
        }

        return { score: 0 };
      } finally {
        clearTimeout(timeout);
      }
    });
  },
};
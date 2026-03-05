import dotenv from "dotenv";

dotenv.config();
import { cloudLLMService } from "../services/ai/cloudLLM.service";

async function runTests() {

  const resumeText = `
  Software Engineer with experience in React, Node.js, and PostgreSQL.
  Built scalable APIs and improved application performance by 40%.
  Experience deploying applications using Docker and AWS.
  `;

  const jobDescription = `
  We are looking for a Backend Developer skilled in Node.js, Docker,
  PostgreSQL, and cloud infrastructure. Experience with scalable APIs required.
  `;

  console.log("Running Improvement Suggestions Test...\n");

  const suggestions =
    await cloudLLMService.generateImprovementSuggestions(
      resumeText,
      jobDescription
    );

  console.log("Suggestions Result:\n", suggestions);

  console.log("\nRunning Experience Quality Test...\n");

  const experience =
    await cloudLLMService.analyzeExperienceQuality(resumeText);

  console.log("Experience Analysis Result:\n", experience);
}

runTests();
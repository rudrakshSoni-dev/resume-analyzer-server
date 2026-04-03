"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cloudLLM_service_1 = require("../services/ai/cloudLLM.service");
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
    const suggestions = await cloudLLM_service_1.cloudLLMService.generateImprovementSuggestions(resumeText, jobDescription);
    console.log("Suggestions Result:\n", suggestions);
    console.log("\nRunning Experience Quality Test...\n");
    const experience = await cloudLLM_service_1.cloudLLMService.analyzeExperienceQuality(resumeText);
    console.log("Experience Analysis Result:\n", experience);
}
runTests();

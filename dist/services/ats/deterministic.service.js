"use strict";
// services/ats/deterministic.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.deterministicService = void 0;
const clamp = (num) => Math.max(0, Math.min(100, Number(num.toFixed(2))));
const toWords = (text) => text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
const extractKeywordsFromJD = (jobDescription) => {
    const words = toWords(jobDescription);
    // Remove very short words and common stopwords
    const stopwords = new Set([
        "the", "and", "for", "with", "you", "are", "this",
        "that", "have", "from", "will", "your", "our",
        "not", "but", "all", "any", "can", "has", "had"
    ]);
    return [...new Set(words.filter(w => w.length > 3 && !stopwords.has(w)))];
};
exports.deterministicService = {
    analyze(resumeText, jobDescription) {
        const resumeWords = toWords(resumeText);
        const resumeSet = new Set(resumeWords);
        const jdKeywords = extractKeywordsFromJD(jobDescription);
        // 1️⃣ Keyword Match Score
        const matchedKeywords = jdKeywords.filter(keyword => resumeSet.has(keyword));
        const keywordScore = jdKeywords.length > 0
            ? (matchedKeywords.length / jdKeywords.length) * 100
            : 50;
        // 2️⃣ Section Detection Score
        const requiredSections = [
            "experience",
            "education",
            "skills",
            "projects"
        ];
        const foundSections = requiredSections.filter(section => resumeText.toLowerCase().includes(section));
        const sectionScore = (foundSections.length / requiredSections.length) * 100;
        // 3️⃣ Skill Presence Score
        const technicalSkills = [
            "javascript", "typescript", "react", "node",
            "python", "java", "c++", "sql",
            "aws", "docker", "kubernetes",
            "mongodb", "postgresql", "git", "linux", "rest", "graphql"
        ];
        const matchedSkills = technicalSkills.filter(skill => resumeSet.has(skill));
        const skillScore = (matchedSkills.length / technicalSkills.length) * 100;
        // 4️⃣ Structure Score
        const lines = resumeText.split("\n").filter(Boolean);
        const bulletCount = lines.filter(line => line.trim().startsWith("-") ||
            line.trim().startsWith("•")).length;
        const hasBullets = bulletCount >= 3 ? 1 : 0;
        const lengthScore = resumeWords.length >= 250 && resumeWords.length <= 900
            ? 1
            : 0;
        const structureScore = ((hasBullets + lengthScore) / 2) * 100;
        return {
            keywordScore: clamp(keywordScore),
            sectionScore: clamp(sectionScore),
            skillScore: clamp(skillScore),
            structureScore: clamp(structureScore),
        };
    }
};

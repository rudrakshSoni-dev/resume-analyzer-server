import axios, { AxiosInstance } from "axios";
import {
  Company,
  Recruiter,
  JobListing,
  CompanySearchResult,
} from "../../types/company.types";
import OpenAI from "openai";

const APIFY_BASE_URL = process.env.APIFY_BASE_URL || "https://api.apify.com/v2";

if (!process.env.APIFY_API_TOKEN) {
  throw new Error("APIFY_API_TOKEN missing in environment");
}

const api: AxiosInstance = axios.create({
  baseURL: APIFY_BASE_URL,
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Runs an Apify actor and waits for completion
 */
async function runActor(actorId: string, input: any) {
  try {
    const run = await api.post(
      `/acts/${actorId}/runs?waitForFinish=120`,
      input
    );

    const datasetId = run.data.data.defaultDatasetId;

    const dataset = await api.get(`/datasets/${datasetId}/items`);

    return dataset.data;
  } catch (error: any) {
    console.error("Apify actor run failed:", error?.response?.data || error);
    return [];
  }
}

export const apifyService = {
  /**
   * Search LinkedIn companies
   */
  async searchLinkedInCompanies(
    keyword: string
  ): Promise<CompanySearchResult[]> {
    const data = await runActor("jupri~linkedin-company-scraper", {
      search: keyword,
    });

    return data.map((c: any) => ({
      name: c.name,
      linkedinUrl: c.linkedinUrl,
      industry: c.industry,
      employeeCount: c.employeeCount,
      website: c.website,
    }));
  },

  /**
   * Fetch single company details
   */
  async fetchCompanyDetails(companyUrl: string): Promise<Company | null> {
    const data = await runActor("jupri~linkedin-company-scraper", {
      companyUrls: [companyUrl],
    });

    if (!data.length) return null;

    const c = data[0];

    return {
      name: c.name,
      linkedinUrl: c.linkedinUrl,
      industry: c.industry,
      employeeCount: c.employeeCount,
      website: c.website,
    };
  },

  /**
   * Fetch recruiter profiles
   */
  async fetchCompanyEmployees(companyUrl: string): Promise<Recruiter[]> {
    const data = await runActor("apify~linkedin-profile-scraper", {
      startUrls: [{ url: companyUrl }],
    });

    return data.map((r: any) => ({
      name: r.fullName,
      title: r.headline,
      linkedinUrl: r.profileUrl,
      company: r.companyName,
    }));
  },

  /**
   * Fetch LinkedIn jobs
   */
  async fetchLinkedInJobs(
    keyword: string,
    location?: string
  ): Promise<JobListing[]> {
    const data = await runActor("apify~linkedin-jobs-scraper", {
      keyword,
      location,
    });

    return data.map((job: any) => ({
      title: job.title,
      company: job.companyName,
      location: job.location,
      jobUrl: job.url,
      description: job.description,
    }));
  },

  /**
   * Generate recruiter outreach message
   */
  async generateRecruiterOutreachMessage(
    resumeText: string,
    jobDescription: string,
    recruiterName: string
  ): Promise<string> {
    const prompt = `
You are helping a job seeker write a LinkedIn outreach message.

Recruiter: ${recruiterName}

Resume:
${resumeText}

Job Description:
${jobDescription}

Write a professional outreach message under 120 words.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: "You generate recruiter outreach messages.",
          },
          { role: "user", content: prompt },
        ],
      });

      return response.choices[0].message.content ?? "";
    } catch (error) {
      console.error("LLM message generation failed:", error);
      return "";
    }
  },
};
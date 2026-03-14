import { runActor } from "../integrations/apify.service";

export interface JobListing {
  title: string;
  company: string;
  location: string;
  jobUrl: string;
  description?: string;
}

export const linkedinService = {

  async searchJobs(keyword: string, location?: string): Promise<JobListing[]> {

    const data = await runActor(
      process.env.APIFY_LINKEDIN_JOBS_ACTOR!,
      {
        keywords: keyword,
        location: location ?? "India",
        maxItems: 30
      }
    );

    return data.map((job: any) => ({
      title: job.title,
      company: job.companyName,
      location: job.location,
      jobUrl: job.url,
      description: job.description
    }));
  }

};
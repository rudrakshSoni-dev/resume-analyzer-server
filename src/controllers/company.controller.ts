import { Request, Response } from "express";
import { apifyService } from "../services/integrations/apify.service";

export const companyController = {

  async searchCompanies(req: Request, res: Response) {
    try {
      const keyword = req.query.keyword as string;

      if (!keyword) {
        return res.status(400).json({ error: "keyword is required" });
      }

      const companies = await apifyService.searchLinkedInCompanies(keyword);

      return res.json({ data: companies });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to search companies" });
    }
  },

  async getCompanyDetails(req: Request, res: Response) {
    try {
      const url = req.query.url as string;

      if (!url) {
        return res.status(400).json({ error: "company url required" });
      }

      const company = await apifyService.fetchCompanyDetails(url);

      return res.json({ data: company });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch company details" });
    }
  },

  async getCompanyRecruiters(req: Request, res: Response) {
    try {
      const url = req.query.url as string;

      if (!url) {
        return res.status(400).json({ error: "company url required" });
      }

      const recruiters = await apifyService.fetchCompanyEmployees(url);

      return res.json({ data: recruiters });

    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch recruiters" });
    }
  },

  async searchJobs(req: Request, res: Response) {
    try {
      const keyword = req.query.keyword as string;
      const location = req.query.location as string;

      if (!keyword) {
        return res.status(400).json({ error: "keyword required" });
      }

      const jobs = await apifyService.fetchLinkedInJobs(keyword, location);

      return res.json({ data: jobs });

    } catch (error) {
      return res.status(500).json({ error: "Failed to search jobs" });
    }
  },
};
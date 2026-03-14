import { Request, Response } from "express";
import { linkedinService } from "../services/scrapers/linkedin.service";

export const jobController = {

  async searchLinkedInJobs(req: Request, res: Response) {

    try {

      const keyword = req.query.keyword as string;
      const location = req.query.location as string;

      if (!keyword) {
        return res.status(400).json({
          message: "keyword query required"
        });
      }

      const jobs = await linkedinService.searchJobs(keyword, location);

      res.json({
        count: jobs.length,
        jobs
      });

    } catch (error: any) {

      res.status(500).json({
        message: "Failed to fetch jobs",
        error: error.message
      });

    }
  }

};
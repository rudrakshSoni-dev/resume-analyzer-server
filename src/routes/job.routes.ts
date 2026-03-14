import { Router } from "express";
import { jobController } from "../controllers/job.controller";

const router = Router();

router.get("/jobs/linkedin", jobController.searchLinkedInJobs);

export default router;
import { Router } from "express";
import { companyController } from "../controllers/company.controller";

const router = Router();

router.get("/companies/search", companyController.searchCompanies);

router.get("/companies/details", companyController.getCompanyDetails);

router.get("/companies/recruiters", companyController.getCompanyRecruiters);

router.get("/jobs/search", companyController.searchJobs);

export default router;
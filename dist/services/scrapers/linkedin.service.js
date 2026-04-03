"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkedinService = void 0;
const apify_service_1 = require("../integrations/apify.service");
exports.linkedinService = {
    async searchJobs(keyword, location) {
        const data = await (0, apify_service_1.runActor)(process.env.APIFY_LINKEDIN_JOBS_ACTOR, {
            keywords: keyword,
            location: location ?? "India",
            maxItems: 30
        });
        return data.map((job) => ({
            title: job.title,
            company: job.companyName,
            location: job.location,
            jobUrl: job.url,
            description: job.description
        }));
    }
};

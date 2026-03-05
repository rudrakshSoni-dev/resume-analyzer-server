import "dotenv/config";
import { apifyService } from "../services/integrations/apify.service";

async function runTest() {

  console.log("Testing company search...");

  const companies = await apifyService.searchLinkedInCompanies("openai");

  console.log(companies);

}

runTest();
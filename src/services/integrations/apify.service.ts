import axios from "axios";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const BASE_URL = process.env.APIFY_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${APIFY_TOKEN}`,
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export async function runActor(actorId: string, input: any) {
  try {
    const run = await api.post(`/acts/${actorId}/runs?waitForFinish=120`, input);

    const datasetId = run.data.data.defaultDatasetId;

    const dataset = await api.get(`/datasets/${datasetId}/items`);

    return dataset.data;
  } catch (error: any) {
    console.error("Apify actor failed:", error.response?.data);
    return [];
  }
}
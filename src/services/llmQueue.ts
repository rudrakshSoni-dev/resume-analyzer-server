// src/services/llmQueue.ts

import PQueue from "p-queue";

export const llmQueue: PQueue = new PQueue({
  concurrency: 1,        // 🔥 CRITICAL (start with 1)
  timeout: 30000,        // 30s timeout// Throw if a task times out
});
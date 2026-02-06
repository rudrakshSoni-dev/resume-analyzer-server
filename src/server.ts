// src/server.ts
import "dotenv/config";
console.log("DB:", process.env.DATABASE_URL);
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import prisma from "./prisma/client";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // connect DB
    await prisma.$connect();
    console.log("Database connected");

    // start server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
}

startServer();

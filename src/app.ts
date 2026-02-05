// src/app.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
// import routes from "./routes";
// import errorMiddleware from "./middleware/error.middleware";

const app = express();

/* -------------------- Middlewares -------------------- */

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- Health check -------------------- */

app.get("/health", (_, res) => {
  res.json({ status: "OK", message: "ATS Analyzer API running 🚀" });
});

/* -------------------- Routes -------------------- */

// app.use("/api", routes);

/* -------------------- Error handler (LAST) -------------------- */

// app.use(errorMiddleware);

export default app;

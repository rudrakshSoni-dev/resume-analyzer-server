// src/app.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
// import routes from "./routes";
// import errorMiddleware from "./middleware/error.middleware";

const app = express();

/* -------------------- Middlewares -------------------- */

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
/* -------------------- Health check -------------------- */

app.get("/health", (_, res) => {
  res.json({ status: "OK", message: "ATS Analyzer API running 🚀" });
});

app.use("/api/v0/auth", authRoutes);


// app.use(errorMiddleware);

export default app;

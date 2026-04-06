import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import { apiLimiter } from "./middleware/rateLimiter";

const app = express();
app.set("trust proxy", 1);


app.use("/api/v0/", apiLimiter); // Apply general API rate limiter to all /api/v0 routes

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_, res) => {
  res.json({ message: "Welcome to the ATS Analyzer API" });
});

app.get("/health", (_, res) => {
  res.json({ status: "OK", message: "ATS Analyzer API running" });
});

app.use("/api/v0/auth", authRoutes);
app.use("/api/v0/resume", require("./routes/resume.routes").default);
// app.use("/api/v0/company", require("./routes/company.routes").default);
// app.use("/api/v0/job", jobRoutes);

export default app;
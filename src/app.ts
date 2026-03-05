import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_, res) => {
  res.json({ status: "OK", message: "ATS Analyzer API running 🚀" });
});

app.use("/api/v0/auth", authRoutes);
app.use("/api/v0/resume", require("./routes/resume.routes").default);
app.use("/api/v0/company", require("./routes/company.routes").default);

export default app;
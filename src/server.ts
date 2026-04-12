import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import cloudinary from "./config/cloudinary";
import app from "./app";
import prisma from "./prisma/client";


const PORT = Number(process.env.PORT) || 5000;
const cloudinary_config = cloudinary.config();
console.log("Cloudinary configured:", !!cloudinary_config.cloud_name);

async function startServer() {
  try {

    // await prisma.$connect();
    console.log("Database connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
        
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
}

startServer();

import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

export const uploadToCloudinary = (
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // important for PDF/DOCX
        folder: "resumes",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url as string);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

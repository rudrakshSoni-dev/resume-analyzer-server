// services/documentParser.service.ts

import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const documentParserService = {
  async parseFile(file: Express.Multer.File): Promise<string> {
    const mimeType = file.mimetype;

    if (mimeType === "application/pdf") {
      const data = await (pdfParse as any)(file.buffer);
      return data.text;
    }

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        buffer: file.buffer,
      });
      return result.value;
    }

    throw new Error("Unsupported file format");
  },
};
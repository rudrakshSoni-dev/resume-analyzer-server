"use strict";
// services/documentParser.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentParserService = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
exports.documentParserService = {
    async parseFile(file) {
        const mimeType = file.mimetype;
        if (mimeType === "application/pdf") {
            const data = await pdf_parse_1.default(file.buffer);
            return data.text;
        }
        if (mimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth_1.default.extractRawText({
                buffer: file.buffer,
            });
            return result.value;
        }
        throw new Error("Unsupported file format");
    },
};

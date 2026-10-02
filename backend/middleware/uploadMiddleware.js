import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    // Preserve original filename (including Devanagari/Marathi characters) with timestamp suffix
    const safeBaseName = baseName
      .replace(/[^a-zA-Z0-9_\-\s\u0900-\u097F]/g, "")
      .trim()
      .replace(/\s+/g, "_") || "document";
    const timestamp = Date.now();
    cb(null, `${safeBaseName}_${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".txt", ".docx", ".md"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format. Please upload PDF, TXT, DOCX, or MD files."), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max limit
});

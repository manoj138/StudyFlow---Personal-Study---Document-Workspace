import fs from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import annotationRoutes from "./routes/annotationRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Utility Middlewares (Allow PDF cross-origin iframe embedding)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: false,
    contentSecurityPolicy: false
  })
);

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5000"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "production") {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Serve uploaded static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "StudyFlow Backend API active and healthy", timestamp: new Date() });
});

// Primary API Routes
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/annotations", annotationRoutes);

// Serve frontend static build files from backend/dist
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// Catch-all wildcard route for SPA client-side routing
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global Error Middleware
app.use(errorHandler);

export default app;

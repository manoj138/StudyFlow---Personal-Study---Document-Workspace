import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  createFromText,
  createFromFile,
  createFromDocument,
  getInterviewSets,
  getInterviewSetById,
  updateInterviewSet,
  deleteInterviewSet,
  saveAttempt,
  evaluateSpokenAnswer
} from "../controllers/interviewController.js";

const router = express.Router();

// Apply auth protection to all interview routes
router.use(protect);

// Extraction & Creation Endpoints
router.post("/create-text", createFromText);
router.post("/create-file", upload.single("file"), createFromFile);
router.post("/create-from-document", createFromDocument);

// Live Spoken Evaluation Endpoint
router.post("/evaluate", evaluateSpokenAnswer);

// Management & Query Endpoints
router.get("/", getInterviewSets);
router.get("/:id", getInterviewSetById);
router.put("/:id", updateInterviewSet);
router.delete("/:id", deleteInterviewSet);

// Attempt & Analytics Recording
router.post("/:id/attempt", saveAttempt);

export default router;


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
  evaluateSpokenAnswer,
  reviewQuestion,
  getDailySprint,
  seedMernCurriculum
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

// Spaced Repetition Sprint & Seeder Endpoints
router.get("/sprint", getDailySprint);
router.post("/seed-mern", seedMernCurriculum);

// Management & Query Endpoints
router.get("/", getInterviewSets);
router.get("/:id", getInterviewSetById);
router.put("/:id", updateInterviewSet);
router.delete("/:id", deleteInterviewSet);

// Attempt & Analytics Recording
router.post("/:id/attempt", saveAttempt);
router.post("/:id/questions/:questionId/review", reviewQuestion);

export default router;


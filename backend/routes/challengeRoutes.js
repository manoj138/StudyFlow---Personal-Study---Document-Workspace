import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  createFromPrompt,
  createFromFile,
  seedDemoRoadmap,
  getChallenges,
  getChallengeById,
  toggleSubTask,
  deleteChallenge
} from "../controllers/challengeController.js";

const router = express.Router();

// Require authentication for all challenge routes
router.use(protect);

// Creation Endpoints
router.post("/create-prompt", createFromPrompt);
router.post("/create-file", upload.single("file"), createFromFile);
router.post("/seed-demo", seedDemoRoadmap);

// Management Endpoints
router.get("/", getChallenges);
router.get("/:id", getChallengeById);
router.patch("/:id/task-toggle", toggleSubTask);
router.delete("/:id", deleteChallenge);

export default router;

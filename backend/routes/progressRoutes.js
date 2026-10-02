import express from "express";
import { getProgress, updateProgress } from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/:documentId")
  .get(getProgress)
  .put(updateProgress);

export default router;

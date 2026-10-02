import express from "express";
import {
  getBookmarks,
  createBookmark,
  deleteBookmark,
  getHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  getNotes,
  createNote,
  updateNote,
  deleteNote
} from "../controllers/annotationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Bookmarks
router.get("/bookmarks", getBookmarks);
router.get("/bookmarks/:documentId", getBookmarks);
router.post("/bookmarks", createBookmark);
router.delete("/bookmarks/:id", deleteBookmark);

// Highlights
router.get("/highlights", getHighlights);
router.get("/highlights/:documentId", getHighlights);
router.post("/highlights", createHighlight);
router.put("/highlights/:id", updateHighlight);
router.delete("/highlights/:id", deleteHighlight);

// Notes
router.get("/notes", getNotes);
router.get("/notes/:documentId", getNotes);
router.post("/notes", createNote);
router.put("/notes/:id", updateNote);
router.delete("/notes/:id", deleteNote);

export default router;

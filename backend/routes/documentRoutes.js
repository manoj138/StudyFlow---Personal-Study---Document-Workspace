import express from "express";
import { uploadDocument, importYouTubeDocument, getDocuments, getDocumentById, deleteDocument } from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/upload", upload.single("file"), uploadDocument);
router.post("/import-youtube", importYouTubeDocument);
router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.delete("/:id", deleteDocument);

export default router;

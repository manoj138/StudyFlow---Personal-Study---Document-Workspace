import express from "express";
import { getSubjects, createSubject, deleteSubject } from "../controllers/subjectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getSubjects)
  .post(createSubject);

router.route("/:id")
  .delete(deleteSubject);

export default router;

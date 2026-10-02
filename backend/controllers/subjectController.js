import { Subject } from "../models/Subject.js";

// @desc    Get all subjects for current user
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
export const createSubject = async (req, res, next) => {
  try {
    const { name, color, icon, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Subject name is required" });
    }

    const subject = await Subject.create({
      userId: req.user._id,
      name,
      color: color || "#6366F1",
      icon: icon || "book",
      description: description || ""
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, error: "Subject not found" });
    }
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

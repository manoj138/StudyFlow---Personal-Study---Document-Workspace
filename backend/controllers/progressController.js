import { ReadingProgress } from "../models/ReadingProgress.js";
import { Document } from "../models/Document.js";
import { User } from "../models/User.js";

// @desc    Get reading progress for a document
// @route   GET /api/progress/:documentId
// @access  Private
export const getProgress = async (req, res, next) => {
  try {
    const progress = await ReadingProgress.findOne({
      userId: req.user._id,
      documentId: req.params.documentId
    });

    if (!progress) {
      return res.status(404).json({ success: false, error: "Progress record not found" });
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Update debounced reading progress
// @route   PUT /api/progress/:documentId
// @access  Private
export const updateProgress = async (req, res, next) => {
  try {
    const { currentPage, scrollPositionRatio, timeSpentIncrementSeconds } = req.body;
    const documentId = req.params.documentId;

    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    const totalPages = doc.totalPages || 1;
    const pageNum = Math.min(Math.max(1, currentPage || 1), totalPages);
    const completionPercentage = Math.round((pageNum / totalPages) * 100);

    let progress = await ReadingProgress.findOne({
      userId: req.user._id,
      documentId
    });

    if (!progress) {
      progress = new ReadingProgress({
        userId: req.user._id,
        documentId
      });
    }

    progress.currentPage = pageNum;
    if (scrollPositionRatio !== undefined) {
      progress.scrollPositionRatio = scrollPositionRatio;
    }
    progress.completionPercentage = completionPercentage;
    progress.lastReadAt = new Date();

    if (timeSpentIncrementSeconds) {
      progress.totalTimeSpentSeconds += timeSpentIncrementSeconds;
      
      // Update global user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "readingStats.totalReadingTimeMinutes": Math.round(timeSpentIncrementSeconds / 60) },
        $set: { "readingStats.lastActiveDate": new Date() }
      });
    }

    await progress.save();

    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

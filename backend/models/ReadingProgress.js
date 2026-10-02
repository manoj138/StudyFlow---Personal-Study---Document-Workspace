import mongoose from "mongoose";

const readingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true
    },
    currentPage: {
      type: Number,
      default: 1
    },
    scrollPositionRatio: {
      type: Number,
      default: 0
    },
    completionPercentage: {
      type: Number,
      default: 0
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    },
    totalTimeSpentSeconds: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

readingProgressSchema.index({ userId: 1, documentId: 1 }, { unique: true });

export const ReadingProgress = mongoose.model("ReadingProgress", readingProgressSchema);

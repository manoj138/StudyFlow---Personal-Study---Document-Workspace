import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ["pdf", "txt", "docx", "md", "youtube"],
      default: "pdf"
    },
    fileSizeBytes: {
      type: Number,
      default: 0
    },
    totalPages: {
      type: Number,
      default: 1
    },
    youtubeUrl: {
      type: String,
      default: ""
    },
    youtubeVideoId: {
      type: String,
      default: ""
    },
    youtubeThumbnail: {
      type: String,
      default: ""
    },
    youtubeDuration: {
      type: String,
      default: ""
    },
    aiSummary: {
      type: String,
      default: ""
    },
    aiKeyPoints: {
      type: [String],
      default: []
    },
    aiChapters: [
      {
        timestamp: { type: String, default: "00:00" },
        seconds: { type: Number, default: 0 },
        title: { type: String, default: "" },
        description: { type: String, default: "" }
      }
    ],
    aiFlashcards: [
      {
        question: { type: String, default: "" },
        answer: { type: String, default: "" }
      }
    ],
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
      index: true
    },
    processingProgress: {
      type: Number,
      default: 0
    },
    extractedText: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);

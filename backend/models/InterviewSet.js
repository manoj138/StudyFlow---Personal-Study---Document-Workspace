import mongoose from "mongoose";

const questionItemSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    keywords: [
      {
        type: String,
        trim: true
      }
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },
    category: {
      type: String,
      default: "General",
      trim: true
    }
  },
  { _id: true }
);

const attemptResultSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId
    },
    question: {
      type: String,
      default: ""
    },
    idealAnswer: {
      type: String,
      default: ""
    },
    userAnswer: {
      type: String,
      default: ""
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    matchedKeywords: [
      {
        type: String
      }
    ],
    missedKeywords: [
      {
        type: String
      }
    ],
    feedback: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const sessionAttemptSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now
    },
    mode: {
      type: String,
      enum: ["practice", "mock"],
      default: "mock"
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    questionsAnswered: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    results: [attemptResultSchema]
  },
  { _id: true }
);

const interviewSetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    topic: {
      type: String,
      default: "General",
      trim: true
    },
    sourceType: {
      type: String,
      enum: ["text", "file", "document"],
      default: "text"
    },
    sourceDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null
    },
    questions: [questionItemSchema],
    attempts: [sessionAttemptSchema],
    bestScore: {
      type: Number,
      default: 0
    },
    lastAttemptDate: {
      type: Date
    }
  },
  { timestamps: true }
);

// Indexes for fast querying
interviewSetSchema.index({ userId: 1, createdAt: -1 });

export const InterviewSet = mongoose.model("InterviewSet", interviewSetSchema);


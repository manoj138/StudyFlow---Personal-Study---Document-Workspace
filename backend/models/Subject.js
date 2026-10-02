import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true
    },
    color: {
      type: String,
      default: "#6366F1"
    },
    icon: {
      type: String,
      default: "book"
    },
    description: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export const Subject = mongoose.model("Subject", subjectSchema);

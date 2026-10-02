import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema(
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
    pageNumber: {
      type: Number,
      required: true
    },
    selectedText: {
      type: String,
      required: true
    },
    color: {
      type: String,
      enum: ["yellow", "green", "blue", "pink"],
      default: "yellow"
    },
    noteText: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export const Highlight = mongoose.model("Highlight", highlightSchema);

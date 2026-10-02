import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true
    },
    noteSnippet: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

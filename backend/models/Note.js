import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
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
      default: 1
    },
    title: {
      type: String,
      default: "Untitled Note"
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);

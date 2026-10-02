import { Bookmark } from "../models/Bookmark.js";
import { Highlight } from "../models/Highlight.js";
import { Note } from "../models/Note.js";

// --- BOOKMARKS ---
export const getBookmarks = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    if (req.params.documentId) {
      query.documentId = req.params.documentId;
    }
    const bookmarks = await Bookmark.find(query).sort({ pageNumber: 1 });
    res.json({ success: true, data: bookmarks });
  } catch (error) {
    next(error);
  }
};

export const createBookmark = async (req, res, next) => {
  try {
    const { documentId, pageNumber, title, noteSnippet } = req.body;
    const bookmark = await Bookmark.create({
      userId: req.user._id,
      documentId,
      pageNumber,
      title: title || `Bookmark Page ${pageNumber}`,
      noteSnippet: noteSnippet || ""
    });
    res.status(201).json({ success: true, data: bookmark });
  } catch (error) {
    next(error);
  }
};

export const deleteBookmark = async (req, res, next) => {
  try {
    await Bookmark.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

// --- HIGHLIGHTS ---
export const getHighlights = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    if (req.params.documentId) {
      query.documentId = req.params.documentId;
    }
    const highlights = await Highlight.find(query).sort({ pageNumber: 1 });
    res.json({ success: true, data: highlights });
  } catch (error) {
    next(error);
  }
};

export const createHighlight = async (req, res, next) => {
  try {
    const { documentId, pageNumber, selectedText, color, noteText } = req.body;
    const highlight = await Highlight.create({
      userId: req.user._id,
      documentId,
      pageNumber,
      selectedText,
      color: color || "yellow",
      noteText: noteText || ""
    });
    res.status(201).json({ success: true, data: highlight });
  } catch (error) {
    next(error);
  }
};

export const deleteHighlight = async (req, res, next) => {
  try {
    await Highlight.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

export const updateHighlight = async (req, res, next) => {
  try {
    const { color, noteText } = req.body;
    const highlight = await Highlight.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { color, noteText },
      { new: true }
    );
    res.json({ success: true, data: highlight });
  } catch (error) {
    next(error);
  }
};

// --- PERSONAL NOTES ---
export const getNotes = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    if (req.params.documentId) {
      query.documentId = req.params.documentId;
    }
    const notes = await Note.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const { documentId, pageNumber, title, content } = req.body;
    const note = await Note.create({
      userId: req.user._id,
      documentId,
      pageNumber: pageNumber || 1,
      title: title || "Untitled Note",
      content
    });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, content },
      { new: true }
    );
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

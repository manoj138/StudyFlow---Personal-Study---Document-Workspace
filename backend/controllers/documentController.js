import path from "path";
import fs from "fs";
import { Document } from "../models/Document.js";
import { ReadingProgress } from "../models/ReadingProgress.js";
import { Bookmark } from "../models/Bookmark.js";
import { Highlight } from "../models/Highlight.js";
import { Note } from "../models/Note.js";
import { processUploadedDocument } from "../services/documentProcessorService.js";
import { fetchYouTubeMetadata, generateYouTubeAINotes } from "../services/youtubeService.js";

// @desc    Import YouTube video URL and generate AI notes & timestamps
// @route   POST /api/documents/import-youtube
// @access  Private
export const importYouTubeDocument = async (req, res, next) => {
  try {
    const { youtubeUrl, subjectId, customTitle } = req.body;
    if (!youtubeUrl) {
      return res.status(400).json({ success: false, error: "YouTube URL is required" });
    }

    if (!subjectId) {
      return res.status(400).json({ success: false, error: "Subject ID is required" });
    }

    // Fetch YouTube Metadata (Video ID, Title, Thumbnail)
    const ytData = await fetchYouTubeMetadata(youtubeUrl);
    const docTitle = customTitle || ytData.title;

    // Create Document record
    const newDoc = await Document.create({
      userId: req.user._id,
      subjectId,
      title: docTitle,
      fileUrl: ytData.embedUrl,
      fileType: "youtube",
      youtubeUrl,
      youtubeVideoId: ytData.videoId,
      youtubeThumbnail: ytData.thumbnailUrl,
      processingStatus: "processing",
      processingProgress: 40
    });

    // Initialize reading progress
    await ReadingProgress.create({
      userId: req.user._id,
      documentId: newDoc._id,
      currentPage: 1,
      scrollPositionRatio: 0,
      completionPercentage: 0
    });

    // Generate AI Notes, Chapters & Flashcards
    const aiData = await generateYouTubeAINotes(docTitle, ytData.videoId);

    newDoc.extractedText = aiData.extractedText;
    newDoc.aiSummary = aiData.aiSummary;
    newDoc.aiKeyPoints = aiData.aiKeyPoints;
    newDoc.aiChapters = aiData.aiChapters;
    newDoc.aiFlashcards = aiData.aiFlashcards;
    newDoc.processingStatus = "ready";
    newDoc.processingProgress = 100;
    await newDoc.save();

    res.status(201).json({
      success: true,
      data: newDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document and process content
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Please upload a document file" });
    }

    const { subjectId, title } = req.body;
    if (!subjectId) {
      return res.status(400).json({ success: false, error: "Subject ID is required" });
    }

    const ext = path.extname(req.file.originalname).substring(1).toLowerCase();
    const fileUrl = `/uploads/${req.file.filename}`;

    // Create initial document record with 'processing' status
    const newDoc = await Document.create({
      userId: req.user._id,
      subjectId,
      title: title || req.file.originalname,
      fileUrl,
      fileType: ext,
      fileSizeBytes: req.file.size,
      processingStatus: "processing",
      processingProgress: 30
    });

    // Initialize reading progress record
    await ReadingProgress.create({
      userId: req.user._id,
      documentId: newDoc._id,
      currentPage: 1,
      scrollPositionRatio: 0,
      completionPercentage: 0
    });

    // Run async text processing
    const processedData = await processUploadedDocument(req.file.path, ext);

    newDoc.extractedText = processedData.extractedText;
    newDoc.totalPages = processedData.totalPages;
    newDoc.toc = processedData.toc;
    newDoc.processingStatus = "ready";
    newDoc.processingProgress = 100;
    await newDoc.save();

    // Emit Socket.IO event if gateway available
    const io = req.app.get("io");
    if (io) {
      io.to(`doc_${newDoc._id}`).emit("document_ready", { documentId: newDoc._id, status: "ready" });
    }

    res.status(201).json({
      success: true,
      data: newDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user documents with filtering & search
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const { subjectId, search, sort } = req.query;
    const query = { userId: req.user._id };

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "title") sortOption = { title: 1 };

    const documents = await Document.find(query)
      .populate("subjectId", "name color icon")
      .sort(sortOption);

    // Fetch progress for each document
    const docIds = documents.map((doc) => doc._id);
    const progressRecords = await ReadingProgress.find({
      userId: req.user._id,
      documentId: { $in: docIds }
    });

    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.documentId.toString()] = p;
    });

    const documentsWithProgress = documents.map((doc) => {
      const docObj = doc.toObject();
      docObj.progress = progressMap[doc._id.toString()] || null;
      return docObj;
    });

    res.json({ success: true, data: documentsWithProgress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document details by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate("subjectId", "name color icon");

    if (!document) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    // Auto-reparse YouTube documents if old static text-white classes exist
    if (document.fileType === "youtube" && document.extractedText && document.extractedText.includes('<strong class="font-bold text-white">')) {
      const updatedAiData = await generateYouTubeAINotes(document.title, document.youtubeVideoId || "course");
      document.extractedText = updatedAiData.extractedText;
      if (updatedAiData.aiSummary) document.aiSummary = updatedAiData.aiSummary;
      if (updatedAiData.aiKeyPoints?.length) document.aiKeyPoints = updatedAiData.aiKeyPoints;
      if (updatedAiData.aiChapters?.length) document.aiChapters = updatedAiData.aiChapters;
      if (updatedAiData.aiFlashcards?.length) document.aiFlashcards = updatedAiData.aiFlashcards;
      await document.save();
    }

    // Auto-reparse uploaded file documents if old placeholder or broken code blocks exist
    if (
      document.fileType !== "youtube" &&
      document.fileUrl &&
      (!document.extractedText ||
        document.extractedText === "Document content extracted for reading." ||
        document.extractedText.includes("glass-card p-4 rounded-xl border-l-4") ||
        document.extractedText.includes("<code>let</code>") ||
        document.extractedText.includes("<code>const</code>") ||
        document.extractedText.includes("<code>var</code>") ||
        (document.extractedText.includes("studyflow-code-block") && /[\u0900-\u097F]/.test(document.extractedText)) ||
        (document.extractedText.includes("↓") && !document.extractedText.includes("my-2.5 pl-4 flex items-center")) ||
        document.extractedText.includes('justify-center my-3') ||
        document.extractedText.includes('space-y-1 leading-relaxed"></div>') ||
        document.extractedText.includes('rounded-xl font-mono text-xs text-indigo-300 space-y-1 leading-relaxed"></div>'))
    ) {
      const filePath = path.join(process.cwd(), document.fileUrl);
      if (fs.existsSync(filePath)) {
        const processed = await processUploadedDocument(filePath, document.fileType);
        document.extractedText = processed.extractedText;
        document.totalPages = processed.totalPages;
        document.toc = processed.toc;
        await document.save();
      }
    }

    const progress = await ReadingProgress.findOne({
      userId: req.user._id,
      documentId: document._id
    });

    res.json({
      success: true,
      data: {
        ...document.toObject(),
        progress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    // Delete local file if exists
    if (document.fileUrl) {
      const relativePath = document.fileUrl.replace(/^\//, "");
      const filePath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await document.deleteOne();
    await ReadingProgress.deleteMany({ documentId: req.params.id, userId: req.user._id });
    await Bookmark.deleteMany({ documentId: req.params.id, userId: req.user._id });
    await Highlight.deleteMany({ documentId: req.params.id, userId: req.user._id });
    await Note.deleteMany({ documentId: req.params.id, userId: req.user._id });

    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

import path from "path";
import fs from "fs";
import { InterviewSet } from "../models/InterviewSet.js";
import { Document } from "../models/Document.js";
import {
  extractTextFromFile,
  extractQuestionsWithAI,
  evaluateAnswerWithAI
} from "../services/interviewService.js";

/**
 * Create Interview Set from pasted / raw text
 */
export const createFromText = async (req, res, next) => {
  try {
    const { title, topic, rawText } = req.body;

    if (!title || !rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide a title and text content containing interview questions or notes."
      });
    }

    const questions = await extractQuestionsWithAI(rawText, topic || "General");

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Could not detect or extract any interview questions from the provided text."
      });
    }

    const interviewSet = await InterviewSet.create({
      userId: req.user._id,
      title: title.trim(),
      topic: topic ? topic.trim() : "General",
      sourceType: "text",
      questions
    });

    res.status(201).json({
      success: true,
      message: `Successfully extracted ${questions.length} interview questions.`,
      interviewSet
    });
  } catch (error) {
    console.error("[Interview Controller Error - createFromText]:", error);
    next(error);
  }
};

/**
 * Create Interview Set from an uploaded file (PDF, Word, MD, TXT)
 */
export const createFromFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file was uploaded. Please upload a PDF, DOCX, TXT, or MD file."
      });
    }

    const { title, topic } = req.body;
    const finalTitle = title ? title.trim() : req.file.originalname.replace(/\.[^/.]+$/, "");
    const finalTopic = topic ? topic.trim() : "General";

    const rawText = await extractTextFromFile(req.file.path);

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Uploaded file appears to be empty or unreadable."
      });
    }

    const questions = await extractQuestionsWithAI(rawText, finalTopic);

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Could not detect any interview questions from the uploaded file."
      });
    }

    const interviewSet = await InterviewSet.create({
      userId: req.user._id,
      title: finalTitle,
      topic: finalTopic,
      sourceType: "file",
      questions
    });

    res.status(201).json({
      success: true,
      message: `Successfully extracted ${questions.length} interview questions from ${req.file.originalname}.`,
      interviewSet
    });
  } catch (error) {
    console.error("[Interview Controller Error - createFromFile]:", error);
    next(error);
  }
};

/**
 * Create Interview Set from an existing workspace Document
 */
export const createFromDocument = async (req, res, next) => {
  try {
    const { documentId, title, topic } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid document ID."
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found in your workspace."
      });
    }

    // Try finding the physical file on server
    let rawText = "";
    if (document.fileUrl) {
      const cleanPath = document.fileUrl.replace(/^[/\\]+/, "");
      const fullPath = path.resolve(process.cwd(), cleanPath);
      if (fs.existsSync(fullPath)) {
        rawText = await extractTextFromFile(fullPath);
      }
    }

    // If file cannot be read directly, use extracted text if stored or fallback
    if (!rawText && document.extractedText) {
      // Strip html tags from extractedText
      rawText = document.extractedText.replace(/<[^>]*>/g, " ");
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Could not extract text content from the selected document."
      });
    }

    const finalTitle = title ? title.trim() : `Interview: ${document.title}`;
    const finalTopic = topic ? topic.trim() : (document.subjectTitle || "General");

    const questions = await extractQuestionsWithAI(rawText, finalTopic);

    const interviewSet = await InterviewSet.create({
      userId: req.user._id,
      title: finalTitle,
      topic: finalTopic,
      sourceType: "document",
      sourceDocumentId: document._id,
      questions
    });

    res.status(201).json({
      success: true,
      message: `Successfully created interview set with ${questions.length} questions.`,
      interviewSet
    });
  } catch (error) {
    console.error("[Interview Controller Error - createFromDocument]:", error);
    next(error);
  }
};

/**
 * Get all interview sets for current user
 */
export const getInterviewSets = async (req, res, next) => {
  try {
    const sets = await InterviewSet.find({ userId: req.user._id })
      .select("title topic sourceType questions bestScore lastAttemptDate createdAt updatedAt")
      .sort({ createdAt: -1 });

    const formattedSets = sets.map((s) => ({
      _id: s._id,
      title: s.title,
      topic: s.topic,
      sourceType: s.sourceType,
      questionCount: s.questions ? s.questions.length : 0,
      bestScore: s.bestScore || 0,
      lastAttemptDate: s.lastAttemptDate || null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }));

    res.json({
      success: true,
      count: formattedSets.length,
      interviewSets: formattedSets
    });
  } catch (error) {
    console.error("[Interview Controller Error - getInterviewSets]:", error);
    next(error);
  }
};

/**
 * Get single interview set by ID (includes full questions & past attempts)
 */
export const getInterviewSetById = async (req, res, next) => {
  try {
    const interviewSet = await InterviewSet.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interviewSet) {
      return res.status(404).json({
        success: false,
        error: "Interview set not found."
      });
    }

    res.json({
      success: true,
      interviewSet
    });
  } catch (error) {
    console.error("[Interview Controller Error - getInterviewSetById]:", error);
    next(error);
  }
};

/**
 * Update interview set (title, topic, questions)
 */
export const updateInterviewSet = async (req, res, next) => {
  try {
    const { title, topic, questions } = req.body;

    const interviewSet = await InterviewSet.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interviewSet) {
      return res.status(404).json({
        success: false,
        error: "Interview set not found."
      });
    }

    if (title) interviewSet.title = title.trim();
    if (topic) interviewSet.topic = topic.trim();
    if (Array.isArray(questions)) interviewSet.questions = questions;

    await interviewSet.save();

    res.json({
      success: true,
      message: "Interview set updated successfully.",
      interviewSet
    });
  } catch (error) {
    console.error("[Interview Controller Error - updateInterviewSet]:", error);
    next(error);
  }
};

/**
 * Delete interview set
 */
export const deleteInterviewSet = async (req, res, next) => {
  try {
    const deleted = await InterviewSet.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Interview set not found."
      });
    }

    res.json({
      success: true,
      message: "Interview set deleted successfully."
    });
  } catch (error) {
    console.error("[Interview Controller Error - deleteInterviewSet]:", error);
    next(error);
  }
};

/**
 * Save user attempt / mock interview session result
 */
export const saveAttempt = async (req, res, next) => {
  try {
    const {
      mode,
      totalQuestions,
      questionsAnswered,
      averageScore,
      durationSeconds,
      results
    } = req.body;

    const interviewSet = await InterviewSet.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interviewSet) {
      return res.status(404).json({
        success: false,
        error: "Interview set not found."
      });
    }

    const newAttempt = {
      mode: mode || "mock",
      totalQuestions: totalQuestions || interviewSet.questions.length,
      questionsAnswered: questionsAnswered || 0,
      averageScore: typeof averageScore === "number" ? Math.round(averageScore) : 0,
      durationSeconds: durationSeconds || 0,
      results: Array.isArray(results) ? results : []
    };

    interviewSet.attempts.push(newAttempt);
    interviewSet.lastAttemptDate = new Date();

    if (newAttempt.averageScore > (interviewSet.bestScore || 0)) {
      interviewSet.bestScore = newAttempt.averageScore;
    }

    await interviewSet.save();

    res.status(201).json({
      success: true,
      message: "Interview session attempt saved.",
      attempt: newAttempt,
      bestScore: interviewSet.bestScore
    });
  } catch (error) {
    console.error("[Interview Controller Error - saveAttempt]:", error);
    next(error);
  }
};

/**
 * Live evaluate candidate's spoken answer
 */
export const evaluateSpokenAnswer = async (req, res, next) => {
  try {
    const { question, idealAnswer, userAnswer, keywords } = req.body;

    if (!question || !idealAnswer) {
      return res.status(400).json({
        success: false,
        error: "Question and ideal answer are required for evaluation."
      });
    }

    const evaluation = await evaluateAnswerWithAI(
      question,
      idealAnswer,
      userAnswer || "",
      Array.isArray(keywords) ? keywords : []
    );

    res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error("[Interview Controller Error - evaluateSpokenAnswer]:", error);
    next(error);
  }
};


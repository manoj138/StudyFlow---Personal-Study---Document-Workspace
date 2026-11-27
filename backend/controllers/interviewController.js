import path from "path";
import fs from "fs";
import { InterviewSet } from "../models/InterviewSet.js";
import { Document } from "../models/Document.js";
import {
  extractTextFromFile,
  extractQuestionsWithAI,
  evaluateAnswerWithAI,
  sanitizeExtractedQuestions
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

    // Auto-heal dirty/merged questions if any (e.g. questions containing leaked answers)
    const hasDirtyQuestions = interviewSet.questions?.some(
      (q) => /(?:ans(?:wer)?\s*[:.)-]?|Q\s*[\):.-])/i.test(q.question)
    );

    if (hasDirtyQuestions) {
      console.log(`[Interview Set Auto-Repair] Sanitizing question set: ${interviewSet.title}`);
      const sanitized = sanitizeExtractedQuestions(interviewSet.questions, interviewSet.topic);
      if (sanitized.length > 0) {
        interviewSet.questions = sanitized;
        await interviewSet.save();
      }
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

/**
 * Update Spaced Repetition status for a question (Anki-style: again, hard, good, easy)
 */
export const reviewQuestion = async (req, res, next) => {
  try {
    const { id, questionId } = req.params;
    const { rating } = req.body; // "again" | "hard" | "good" | "easy"

    const interviewSet = await InterviewSet.findOne({ _id: id, userId: req.user._id });
    if (!interviewSet) {
      return res.status(404).json({ success: false, error: "Interview set not found." });
    }

    const question = interviewSet.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found." });
    }

    if (!question.spacedRepetition) {
      question.spacedRepetition = {
        status: "new",
        intervalDays: 1,
        nextReviewDate: new Date(),
        reviewCount: 0
      };
    }

    let interval = question.spacedRepetition.intervalDays || 1;
    let status = question.spacedRepetition.status || "new";

    if (rating === "again") {
      interval = 1;
      status = "learning";
    } else if (rating === "hard") {
      interval = Math.max(1, Math.round(interval * 1.2));
      status = "learning";
    } else if (rating === "good") {
      interval = Math.max(3, Math.round(interval * 2.0));
      status = "review";
    } else if (rating === "easy") {
      interval = Math.max(7, Math.round(interval * 2.5));
      status = "mastered";
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    question.spacedRepetition.intervalDays = interval;
    question.spacedRepetition.status = status;
    question.spacedRepetition.nextReviewDate = nextDate;
    question.spacedRepetition.lastReviewedDate = new Date();
    question.spacedRepetition.reviewCount = (question.spacedRepetition.reviewCount || 0) + 1;

    await interviewSet.save();

    res.json({
      success: true,
      message: `Question marked as ${status} (next review in ${interval} days)`,
      spacedRepetition: question.spacedRepetition
    });
  } catch (error) {
    console.error("[Interview Controller Error - reviewQuestion]:", error);
    next(error);
  }
};

/**
 * Get curated Daily Sprint of 5 questions due for active recall
 */
export const getDailySprint = async (req, res, next) => {
  try {
    const sets = await InterviewSet.find({ userId: req.user._id });

    const allQuestions = [];
    for (const s of sets) {
      if (s.questions) {
        for (const q of s.questions) {
          allQuestions.push({
            setId: s._id,
            setTitle: s.title,
            setTopic: s.topic,
            questionId: q._id,
            question: q.question,
            answer: q.answer,
            marathiExplanation: q.marathiExplanation || "",
            keywords: q.keywords || [],
            difficulty: q.difficulty || "medium",
            category: q.category || s.topic,
            track: q.track || "general",
            spacedRepetition: q.spacedRepetition || { status: "new", intervalDays: 1, nextReviewDate: new Date() }
          });
        }
      }
    }

    const now = new Date();
    const dueQuestions = allQuestions.filter((q) => {
      const nextDate = new Date(q.spacedRepetition.nextReviewDate || 0);
      return nextDate <= now;
    });

    let sprintList = [];
    if (dueQuestions.length >= 5) {
      sprintList = dueQuestions.slice(0, 5);
    } else {
      const remainingCount = 5 - dueQuestions.length;
      const otherQuestions = allQuestions.filter((q) => !dueQuestions.includes(q));
      sprintList = [...dueQuestions, ...otherQuestions.slice(0, remainingCount)];
    }

    const totalMastered = allQuestions.filter((q) => q.spacedRepetition?.status === "mastered").length;
    const totalLearning = allQuestions.filter((q) => q.spacedRepetition?.status === "learning").length;

    res.json({
      success: true,
      sprintQuestions: sprintList,
      stats: {
        totalQuestions: allQuestions.length,
        masteredCount: totalMastered,
        learningCount: totalLearning,
        dueCount: dueQuestions.length,
        readinessScore: allQuestions.length > 0 ? Math.round((totalMastered / allQuestions.length) * 100) : 0
      }
    });
  } catch (error) {
    console.error("[Interview Controller Error - getDailySprint]:", error);
    next(error);
  }
};

/**
 * Auto-Seed official MERN Stack Curriculum from preloaded markdown guide
 */
export const seedMernCurriculum = async (req, res, next) => {
  try {
    const filePath = path.resolve(process.cwd(), "data/MERN_Stack_Complete_Interview_QA.md");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: "MERN curriculum file not found." });
    }

    const content = fs.readFileSync(filePath, "utf-8");

    // Check if user already has seeded MERN sets
    const existing = await InterviewSet.findOne({
      userId: req.user._id,
      title: { $regex: /MERN Stack/i }
    });

    if (existing) {
      return res.json({
        success: true,
        message: "MERN Curriculum already loaded.",
        interviewSet: existing
      });
    }

    // Split markdown by Question blocks
    const qaBlocks = content.split(/\n(?=\*\*Q\d+[:.]|\*\*Q\s*\d+)/g);
    const questions = [];

    for (const block of qaBlocks) {
      const qMatch = block.match(/\*\*Q\d*[:.]\s*([^*]+)\*\*/i);
      const aMatch = block.match(/\*\*Ans:\*\*\s*([\s\S]*?)(?=(?:\*\*मराठी स्पष्टीकरण:\*\*|\n\n\*\*Q|$))/i);
      const mMatch = block.match(/\*\*मराठी स्पष्टीकरण:\*\*\s*([\s\S]*?)(?=(?:\n\n\*\*Q|$))/i);

      if (qMatch && aMatch) {
        const qText = qMatch[1].trim();
        const aText = aMatch[1].trim();
        const mText = mMatch ? mMatch[1].trim() : "";

        if (qText.length > 3 && aText.length > 3) {
          questions.push({
            question: qText,
            answer: aText,
            marathiExplanation: mText,
            keywords: aText
              .replace(/[^a-zA-Z0-9_\-\s]/g, " ")
              .split(/\s+/)
              .filter((w) => w.length > 4)
              .slice(0, 5),
            difficulty: "medium",
            category: "MERN Full Stack",
            track: "mern_core",
            spacedRepetition: {
              status: "new",
              intervalDays: 1,
              nextReviewDate: new Date()
            }
          });
        }
      }
    }

    const createdSet = await InterviewSet.create({
      userId: req.user._id,
      title: "MERN Stack Official Interview Mastery (Core Track)",
      topic: "MERN Stack",
      sourceType: "text",
      questions
    });

    res.status(201).json({
      success: true,
      message: `Seeded ${questions.length} official MERN Stack questions with Marathi explanations!`,
      interviewSet: createdSet
    });
  } catch (error) {
    console.error("[Interview Controller Error - seedMernCurriculum]:", error);
    next(error);
  }
};


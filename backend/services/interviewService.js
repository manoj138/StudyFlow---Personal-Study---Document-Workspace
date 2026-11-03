import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const STOPWORDS = new Set([
  "the", "and", "is", "in", "it", "to", "of", "for", "with", "on", "that", "this",
  "are", "as", "by", "was", "be", "at", "or", "from", "an", "your", "can", "have",
  "has", "we", "you", "they", "which", "will", "all", "also", "into", "use", "used",
  "using", "when", "what", "how", "why", "where", "who", "more", "then", "their",
  "such", "than", "other", "some", "these", "between", "each", "both", "through"
]);

/**
 * Extract clean keywords from text heuristically
 */
export const extractKeywordsHeuristic = (text, maxCount = 5) => {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9_\-\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCount)
    .map(([w]) => w);
};

/**
 * Extract raw text from different file types
 */
export const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }

  if (ext === ".txt" || ext === ".md") {
    return fs.readFileSync(filePath, "utf-8");
  }

  throw new Error(`Unsupported file extension: ${ext}`);
};

/**
 * Fallback regex/heuristic Q&A parser for when AI is unavailable or offline
 */
export const parseQuestionsHeuristic = (rawText, defaultTopic = "General") => {
  const cleaned = rawText.replace(/\r\n/g, "\n");
  const questions = [];

  // Strategy 1: Look for explicit Question / Answer tags
  // Matches Q: ... Ans: ... or Question 1: ... Answer: ...
  const qaPattern = /(?:(?:^|\n)(?:Q(?:uestion)?\s*(?:\d+)?[:.)-]|(\d+)[\.\)])\s*([\s\S]*?))(?=(?:(?:\n|\s*)(?:A(?:nswer)?\s*(?:\d+)?[:.)-]|Ans[:.)-])\s*))(?:\n|\s*)(?:A(?:nswer)?\s*(?:\d+)?[:.)-]|Ans[:.)-])\s*([\s\S]*?)(?=(?:\n\s*(?:Q(?:uestion)?\s*(?:\d+)?[:.)-]|\d+[\.\)])|$))/gi;

  let match;
  while ((match = qaPattern.exec(cleaned)) !== null) {
    const qText = (match[2] || "").trim();
    const aText = (match[3] || "").trim();

    if (qText.length > 5 && aText.length > 5) {
      questions.push({
        question: qText.replace(/^[:.)-\s]+/, "").trim(),
        answer: aText.trim(),
        keywords: extractKeywordsHeuristic(aText, 5),
        difficulty: "medium",
        category: defaultTopic
      });
    }
  }

  // Strategy 2: If no explicit Q/A tags, split by Markdown headers (### or ##)
  if (questions.length === 0) {
    const sections = cleaned.split(/\n(?=#{1,3}\s+|\d+\.\s+)/g);
    for (const section of sections) {
      const lines = section.trim().split("\n");
      if (lines.length >= 2) {
        const header = lines[0].replace(/^#{1,3}\s*|\d+\.\s*/, "").trim();
        const body = lines.slice(1).join("\n").trim();
        if (header.length > 8 && body.length > 10) {
          questions.push({
            question: header.endsWith("?") ? header : `Explain: ${header}`,
            answer: body,
            keywords: extractKeywordsHeuristic(body, 5),
            difficulty: "medium",
            category: defaultTopic
          });
        }
      }
    }
  }

  // Strategy 3: Paragraph splitter fallback if still empty
  if (questions.length === 0) {
    const paragraphs = cleaned
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 30);

    for (let i = 0; i < paragraphs.length; i += 2) {
      const q = paragraphs[i];
      const a = paragraphs[i + 1] || "Review core concept and key principles.";
      questions.push({
        question: q.length < 120 ? q : `Explain the key concepts of: ${q.slice(0, 80)}...`,
        answer: a,
        keywords: extractKeywordsHeuristic(a, 4),
        difficulty: "medium",
        category: defaultTopic
      });
    }
  }

  return questions.slice(0, 50); // limit to reasonable set size
};

/**
 * Intelligent Q&A parser using Google Gemini with automatic model fallback
 */
export const extractQuestionsWithAI = async (rawText, defaultTopic = "General") => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Truncate input to avoid exceeding token limits (first ~25,000 characters)
  const truncatedText = rawText.slice(0, 25000);

  if (apiKey) {
    const modelsToTry = [
      "gemini-flash-latest",
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash"
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `
You are an expert technical interviewer and educator.
Extract all interview questions and comprehensive answers from the text below.
If the text contains notes instead of Q&A, create high-impact interview questions and model answers based on the material.
For each question, extract 3-5 crucial technical keywords/phrases an interviewer expects to hear.
Provide an appropriate difficulty ('easy', 'medium', or 'hard') and category/topic.

Return ONLY a valid JSON array of objects. Do not include markdown code block ticks, do not include explanations outside the JSON array.
Format:
[
  {
    "question": "What is ...?",
    "answer": "Detailed model answer...",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "difficulty": "medium",
    "category": "${defaultTopic}"
  }
]

Input Content:
${truncatedText}
`;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192
          }
        });

        const result = await model.generateContent(prompt);
        const text = result?.response?.text();

        if (text) {
          const cleanJson = text
            .replace(/```(?:json)?/gi, "")
            .replace(/```/g, "")
            .trim();

          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item) => ({
              question: String(item.question || "").trim(),
              answer: String(item.answer || "").trim(),
              keywords: Array.isArray(item.keywords)
                ? item.keywords.map((k) => String(k).trim())
                : extractKeywordsHeuristic(item.answer || "", 4),
              difficulty: ["easy", "medium", "hard"].includes(item.difficulty)
                ? item.difficulty
                : "medium",
              category: String(item.category || defaultTopic).trim()
            }));
          }
        }
      } catch (err) {
        console.warn(`[Interview AI Parser] Model ${modelName} failed:`, err.message);
      }
    }
  }

  // If AI generation fails or no API key, use reliable heuristic fallback
  console.log("[Interview AI Parser] Falling back to heuristic rule-based parser.");
  return parseQuestionsHeuristic(rawText, defaultTopic);
};

/**
 * Fast client/server heuristic answer evaluation
 */
export const evaluateAnswerHeuristic = (idealAnswer, userAnswer, keywords = []) => {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return {
      score: 0,
      matchedKeywords: [],
      missedKeywords: keywords,
      feedback: "No spoken answer detected. Try speaking clearly into the microphone."
    };
  }

  const userLower = userAnswer.toLowerCase();
  const matched = [];
  const missed = [];

  const checkKeywords = keywords.length > 0 ? keywords : extractKeywordsHeuristic(idealAnswer, 5);

  for (const kw of checkKeywords) {
    if (userLower.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missedKeywords: missed.push(kw);
    }
  }

  // Calculate score based on keyword coverage + word volume
  const keywordRatio = checkKeywords.length > 0 ? matched.length / checkKeywords.length : 0.5;
  const idealWordCount = idealAnswer.split(/\s+/).length;
  const userWordCount = userAnswer.split(/\s+/).length;
  const lengthRatio = Math.min(1, userWordCount / Math.max(10, idealWordCount * 0.4));

  const rawScore = Math.round(keywordRatio * 75 + lengthRatio * 25);
  const score = Math.max(0, Math.min(100, rawScore));

  let feedback = "Good attempt! ";
  if (score >= 85) {
    feedback = "Excellent! You covered almost all core concepts and explained clearly.";
  } else if (score >= 65) {
    feedback = `Solid answer! You hit key concepts, but remember to mention: ${missed.slice(0, 3).join(", ") || "additional details"}.`;
  } else if (score >= 40) {
    feedback = `Decent start, but key points were missing: ${missed.slice(0, 3).join(", ")}. Review the model answer.`;
  } else {
    feedback = "The answer was brief or off-target. Compare with the ideal answer and practice speaking again.";
  }

  return {
    score,
    matchedKeywords: matched,
    missedKeywords: missed,
    feedback
  };
};

/**
 * AI-powered deep evaluation of a user's spoken answer
 */
export const evaluateAnswerWithAI = async (question, idealAnswer, userAnswer, keywords = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!userAnswer || userAnswer.trim().length < 5) {
    return evaluateAnswerHeuristic(idealAnswer, userAnswer, keywords);
  }

  if (apiKey) {
    const modelsToTry = [
      "gemini-flash-latest",
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3.8-flash",
      "gemini-1.5-flash"
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `
You are a senior tech interviewer evaluating a candidate's spoken answer in a live technical interview.
Question: "${question}"
Model Answer: "${idealAnswer}"
Candidate's Spoken Answer: "${userAnswer}"
Expected Keywords: ${JSON.stringify(keywords)}

Evaluate the candidate's answer fairly and constructively.
Return ONLY a valid JSON object matching:
{
  "score": <number between 0 and 100>,
  "matchedKeywords": ["keyword1", ...],
  "missedKeywords": ["keyword2", ...],
  "feedback": "2-3 constructive sentences explaining what was good and specifically what to improve."
}
`;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024
          }
        });

        const result = await model.generateContent(prompt);
        const text = result?.response?.text();

        if (text) {
          const cleanJson = text
            .replace(/```(?:json)?/gi, "")
            .replace(/```/g, "")
            .trim();

          const parsed = JSON.parse(cleanJson);
          if (typeof parsed.score === "number") {
            return {
              score: Math.max(0, Math.min(100, Math.round(parsed.score))),
              matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
              missedKeywords: Array.isArray(parsed.missedKeywords) ? parsed.missedKeywords : [],
              feedback: parsed.feedback || "Good response."
            };
          }
        }
      } catch (err) {
        console.warn(`[Evaluation AI] Model ${modelName} failed:`, err.message);
      }
    }
  }

  // Fallback to heuristic evaluator
  return evaluateAnswerHeuristic(idealAnswer, userAnswer, keywords);
};


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
 * Universal regex/heuristic Q&A parser for Markdown (.md), PDF, Word (.docx), and plain text
 */
export const parseQuestionsHeuristic = (rawText, defaultTopic = "General") => {
  if (!rawText) return [];
  
  let cleaned = rawText.replace(/\r\n/g, "\n");

  // 1. Markdown Normalization: Clean bold and heading markers around Q/A
  cleaned = cleaned.replace(/\*\*(?:ans(?:wer)?)\s*[:.)-]?\*\*/gi, "Ans: ");
  cleaned = cleaned.replace(/\*\*(?:q(?:uestion)?\s*\d*)\s*[:.)-]?\*\*/gi, "Q: ");
  cleaned = cleaned.replace(/\*\*(?:marathi\s+explanation|मराठी\s+स्पष्टीकरण)\s*[:.)-]?\*\*/gi, "मराठी स्पष्टीकरण: ");
  cleaned = cleaned.replace(/^[ \t]*#{1,4}\s+/gm, "");

  const questions = [];

  // Strategy 1: Explicit Q-tag Chunk Parser (Q ), Q:, Q1), Question 1:, etc.)
  // Bullet points like 1), 2) or 1., 2. inside answers are NEVER treated as questions!
  const hasQTag = /(?:^|\n|\s)Q(?:uestion)?\s*\d*\s*[\):.-]/i.test(cleaned);
  if (hasQTag) {
    const chunks = cleaned.split(/(?:^|\n|\s+)(?=Q(?:uestion)?\s*\d*[\):.-])/gi);
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;

      const m = trimmed.match(/^Q(?:uestion)?\s*\d*[\):.-]\s*([\s\S]*?)(?:\s+(?:ans(?:wer)?\s*[:.)-]?|\bA\s*[\):.-])\s+)([\s\S]*)$/i);
      if (m) {
        let qText = m[1].trim();
        let aText = m[2].trim();

        // Clean document titles or initial headers
        qText = qText.replace(/^.*?\(?\d+\s*questions?\)?\s*/i, "").trim();
        qText = qText.replace(/^[:.)-\s]+/, "").trim();
        aText = aText.replace(/^ans(?:wer)?\s*[:.)-]?\s*/i, "").trim();

        if (qText.length > 3 && aText.length > 2) {
          let englishAns = aText;
          let marathiExp = "";

          if (aText.includes("मराठी स्पष्टीकरण:")) {
            const parts = aText.split(/\*{0,2}मराठी स्पष्टीकरण:\*{0,2}\s*/);
            englishAns = (parts[0] || "").trim();
            marathiExp = (parts[1] || "").trim();
          } else if (/marathi explanation:/i.test(aText)) {
            const parts = aText.split(/\*{0,2}marathi explanation:\*{0,2}\s*/i);
            englishAns = (parts[0] || "").trim();
            marathiExp = (parts[1] || "").trim();
          }

          questions.push({
            question: qText,
            answer: englishAns,
            marathiExplanation: marathiExp,
            keywords: extractKeywordsHeuristic(englishAns, 5),
            difficulty: "medium",
            category: defaultTopic,
            track: defaultTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")
          });
        }
      }
    }
  }

  // Strategy 2: Numbered questions with explicit answer tags (1. What is X? ans ... 2. What is Y? ans ...)
  if (questions.length === 0) {
    const chunks = cleaned.split(/(?:^|\n)(?=\d+[\).]\s+)/g);
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;

      const m = trimmed.match(/^\d+[\).]\s*([\s\S]*?)(?:\s+(?:ans(?:wer)?\s*[:.)-]?|\bA\s*[\):.-])\s+)([\s\S]*)$/i);
      if (m) {
        let qText = m[1].trim().replace(/^.*?\(?\d+\s*questions?\)?\s*/i, "").replace(/^[:.)-\s]+/, "").trim();
        let aText = m[2].trim().replace(/^ans(?:wer)?\s*[:.)-]?\s*/i, "").trim();

        if (qText.length > 3 && aText.length > 2) {
          questions.push({
            question: qText,
            answer: aText,
            marathiExplanation: "",
            keywords: extractKeywordsHeuristic(aText, 5),
            difficulty: "medium",
            category: defaultTopic,
            track: defaultTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")
          });
        }
      }
    }
  }

  // Strategy 3: Questions ending with '?' followed by ans/answer
  if (questions.length === 0) {
    const qMarkPattern = /([\s\S]*?\?)\s*(?:ans(?:wer)?\s*[:.)-]?|\bA\s*[\):.-])\s*([\s\S]*?)(?=(?:[\s\S]*?\?\s*(?:ans(?:wer)?\s*[:.)-]?|\bA\s*[\):.-]))|$)/gi;
    let match;
    while ((match = qMarkPattern.exec(cleaned)) !== null) {
      let q = (match[1] || "").trim().replace(/^.*?\(?\d+\s*questions?\)?\s*/i, "").replace(/^[:.)-\s]+/, "");
      let a = (match[2] || "").trim().replace(/^ans(?:wer)?\s*[:.)-]?\s*/i, "");
      if (q.length > 5 && a.length > 3) {
        questions.push({
          question: q,
          answer: a,
          marathiExplanation: "",
          keywords: extractKeywordsHeuristic(a, 5),
          difficulty: "medium",
          category: defaultTopic,
          track: defaultTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")
        });
      }
    }
  }

  // Strategy 4: Standard Markdown headers (## Question or ### Question)
  if (questions.length === 0) {
    const sections = rawText.split(/\n(?=#{1,4}\s+)/g);
    for (const section of sections) {
      const lines = section.trim().split("\n");
      if (lines.length >= 2) {
        const header = lines[0].replace(/^#{1,4}\s*|\d+[\).]\s*/g, "").trim();
        const body = lines.slice(1).join("\n").trim();
        if (header.length > 5 && body.length > 5) {
          questions.push({
            question: header.endsWith("?") ? header : `Explain: ${header}`,
            answer: body,
            keywords: extractKeywordsHeuristic(body, 5),
            difficulty: "medium",
            category: defaultTopic,
            track: defaultTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")
          });
        }
      }
    }
  }

  // Strategy 5: Paragraph fallback only if nothing else matched
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
        category: defaultTopic,
        track: defaultTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")
      });
    }
  }

  // Support massive question banks (e.g. 1000 to 3000 questions) without arbitrary truncation
  return questions.slice(0, 3000);
};

/**
 * Post-processor that guarantees every question object has only a pure question title,
 * full answer without truncation, and repairs broken answers.
 */
export const sanitizeExtractedQuestions = (questions = [], defaultTopic = "General") => {
  const sanitized = [];

  for (let i = 0; i < questions.length; i++) {
    const item = questions[i];
    let q = String(item.question || "").trim();
    let a = String(item.answer || "").trim();

    // Check if q has leaked answers (e.g. contains 'ans' or 'Q )')
    if (/(?:ans(?:wer)?\s*[:.)-]?|Q\s*[\):.-])/i.test(q)) {
      const splitItems = parseQuestionsHeuristic(q, item.category || defaultTopic);
      if (splitItems.length > 0) {
        sanitized.push(...splitItems);
        continue;
      }

      // Single leaked answer match
      const singleMatch = q.match(/^([\s\S]*?)(?:\s+(?:ans(?:wer)?\s*[:.)-]?|\bA\s*[\):.-])\s+)([\s\S]*)$/i);
      if (singleMatch) {
        q = singleMatch[1].trim();
        if (!a || a.includes("Review core concept") || a.includes("Review the model answer")) {
          a = singleMatch[2].trim();
        }
      }
    }

    // Clean any residual headers, Markdown syntax, or Q markers from question
    q = q.replace(/^.*?\(?\d+\s*questions?\)?\s*/i, "").trim();
    q = q.replace(/^#{1,4}\s+/g, "").trim();
    q = q.replace(/^\*{1,2}(.*?)\*{1,2}$/, "$1").trim();
    q = q.replace(/^Q(?:uestion)?\s*\d*[\):.-]\s*/i, "").trim();
    q = q.replace(/^[:.)-\s]+/, "").trim();

    // Clean answer
    a = a.replace(/^ans(?:wer)?\s*[:.)-]?\s*/i, "").trim();
    a = a.replace(/^\*{1,2}ans(?:wer)?\s*[:.)-]?\*{1,2}\s*/i, "").trim();

    // AUTO-STITCH REPAIR:
    // If the answer is truncated to < 5 words and ends with colon/comma/dash (e.g. "CPU components include:"),
    // and the next item looks like a bullet item, merge them together into a complete answer!
    if (a.split(/\s+/).length < 6 && /[:,\-–]\s*$/i.test(a) && i + 1 < questions.length) {
      const nextItem = questions[i + 1];
      const nextQ = String(nextItem.question || "").trim();
      const nextA = String(nextItem.answer || "").trim();
      if (/^(?:\d+[\).]|[•\-\*]|ALU|Registers|L1|L2)/i.test(nextQ)) {
        a = `${a} ${nextQ} ${nextA}`.trim();
        i++; // skip next item since it was stitched into this answer
      }
    }

    if (q.length > 3) {
      sanitized.push({
        ...item,
        question: q,
        answer: a || "Review the model answer.",
        keywords: Array.isArray(item.keywords) && item.keywords.length > 0 ? item.keywords : extractKeywordsHeuristic(a, 5),
        difficulty: ["easy", "medium", "hard"].includes(item.difficulty) ? item.difficulty : "medium",
        category: item.category || defaultTopic,
        track: item.track || defaultTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")
      });
    }
  }

  return sanitized;
};

/**
 * Intelligent Q&A parser using Google Gemini with automatic model fallback
 */
export const extractQuestionsWithAI = async (rawText, defaultTopic = "General") => {
  // If rawText already contains structured Q&A markers (e.g. 'Q ) ... ans ...' or '1. ... ans ...')
  const heuristicMatch = parseQuestionsHeuristic(rawText, defaultTopic);
  if (heuristicMatch.length >= 2) {
    console.log(`[Interview Parser] Detected ${heuristicMatch.length} explicit structured questions from source.`);
    return sanitizeExtractedQuestions(heuristicMatch, defaultTopic);
  }

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

CRITICAL SEPARATION RULES:
1. The 'question' property MUST contain ONLY the question title (e.g. "What is an Operating System (OS)?").
2. NEVER include 'ans', answers, or multiple questions inside the 'question' property!
3. The 'answer' property MUST contain ONLY the corresponding model answer.
4. Each item in the array MUST represent exactly ONE question and answer pair.

Return ONLY a valid JSON array of objects. Do not include markdown code block ticks, do not include explanations outside the JSON array.
Format:
[
  {
    "question": "What is ...?",
    "answer": "Detailed model answer in English...",
    "marathiExplanation": "Simple concept explanation in Marathi if available or concept summary",
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
            const mapped = parsed.map((item) => ({
              question: String(item.question || "").trim(),
              answer: String(item.answer || "").trim(),
              marathiExplanation: String(item.marathiExplanation || "").trim(),
              keywords: Array.isArray(item.keywords)
                ? item.keywords.map((k) => String(k).trim())
                : extractKeywordsHeuristic(item.answer || "", 4),
              difficulty: ["easy", "medium", "hard"].includes(item.difficulty)
                ? item.difficulty
                : "medium",
              category: String(item.category || defaultTopic).trim(),
              track: String(item.category || defaultTopic).toLowerCase().replace(/[^a-z0-9]/g, "_")
            }));
            return sanitizeExtractedQuestions(mapped, defaultTopic);
          }
        }
      } catch (err) {
        console.warn(`[Interview AI Parser] Model ${modelName} failed:`, err.message);
      }
    }
  }

  // If AI generation fails or no API key, use reliable heuristic fallback
  console.log("[Interview AI Parser] Falling back to heuristic rule-based parser.");
  return sanitizeExtractedQuestions(parseQuestionsHeuristic(rawText, defaultTopic), defaultTopic);
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


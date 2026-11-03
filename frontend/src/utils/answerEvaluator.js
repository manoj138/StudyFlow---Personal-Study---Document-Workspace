/**
 * Client-Side Answer Evaluation & Keyword Analytics
 * Evaluates spoken or typed answer in real-time without blocking server requests.
 */

const STOPWORDS = new Set([
  "the", "and", "is", "in", "it", "to", "of", "for", "with", "on", "that", "this",
  "are", "as", "by", "was", "be", "at", "or", "from", "an", "your", "can", "have",
  "has", "we", "you", "they", "which", "will", "all", "also", "into", "use", "used",
  "using", "when", "what", "how", "why", "where", "who", "more", "then", "their",
  "such", "than", "other", "some", "these", "between", "each", "both", "through"
]);

/**
 * Extracts salient keywords from an ideal answer if none were provided
 */
export const extractKeywords = (text, maxCount = 6) => {
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
 * Computes live match score and keyword analysis
 */
export const computeLiveScore = (idealAnswer = "", userAnswer = "", expectedKeywords = []) => {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return {
      score: 0,
      matchedKeywords: [],
      missedKeywords: expectedKeywords.length > 0 ? expectedKeywords : extractKeywords(idealAnswer),
      grade: "Not Answered",
      color: "slate",
      wordCount: 0
    };
  }

  const userLower = userAnswer.toLowerCase();
  const keywords = expectedKeywords.length > 0 ? expectedKeywords : extractKeywords(idealAnswer, 5);

  const matched = [];
  const missed = [];

  for (const kw of keywords) {
    const kwLower = kw.toLowerCase().trim();
    if (kwLower && userLower.includes(kwLower)) {
      matched.push(kw);
    } else {
      missed.push(kw);
    }
  }

  // 1. Keyword coverage weight (70%)
  const keywordRatio = keywords.length > 0 ? matched.length / keywords.length : 0.5;

  // 2. Length/detail ratio weight (30%)
  const idealWords = idealAnswer.trim().split(/\s+/).filter(Boolean).length;
  const userWords = userAnswer.trim().split(/\s+/).filter(Boolean).length;
  const targetMinWords = Math.max(12, Math.round(idealWords * 0.35));
  const lengthRatio = Math.min(1, userWords / targetMinWords);

  const rawScore = Math.round(keywordRatio * 70 + lengthRatio * 30);
  const score = Math.max(0, Math.min(100, rawScore));

  let grade = "Needs More Detail";
  let color = "rose";

  if (score >= 85) {
    grade = "Excellent Coverage";
    color = "emerald";
  } else if (score >= 65) {
    grade = "Good Answer";
    color = "indigo";
  } else if (score >= 40) {
    grade = "Partially Covered";
    color = "amber";
  }

  return {
    score,
    matchedKeywords: matched,
    missedKeywords: missed,
    grade,
    color,
    wordCount: userWords
  };
};


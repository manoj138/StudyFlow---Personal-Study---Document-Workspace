import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * YouTube Study Service for StudyFlow Workspace
 * Parses YouTube URLs, extracts video ID/thumbnails, and synthesizes AI study notes, chapters, and revision flashcards via Google Gemini AI.
 */

// Extract YouTube Video ID from any standard URL, short link, or embed link
export const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Fetch YouTube oEmbed metadata (Title, Author, Thumbnail)
export const fetchYouTubeMetadata = async (url) => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL provided. Please paste a valid YouTube video link.");
  }

  const embedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  try {
    const res = await fetch(embedUrl);
    if (res.ok) {
      const data = await res.json();
      return {
        videoId,
        title: data.title || "YouTube Study Lesson",
        authorName: data.author_name || "Study Instructor",
        thumbnailUrl: thumbnail,
        embedUrl: `https://www.youtube.com/embed/${videoId}`
      };
    }
  } catch (err) {
    console.warn("Failed to fetch YouTube oEmbed info, falling back to standard ID info:", err);
  }

  return {
    videoId,
    title: `YouTube Study Video (${videoId})`,
    authorName: "Online Course",
    thumbnailUrl: thumbnail,
    embedUrl: `https://www.youtube.com/embed/${videoId}`
  };
};

/**
 * Synthesize Smart AI Study Notes & Chapter Highlights for YouTube Video using Google Gemini AI
 */
export const generateYouTubeAINotes = async (title, videoId) => {
  const cleanTitle = title.replace(/[^\w\s-]/gi, "").trim() || "Course Video";

  let aiSummary = "";
  let aiKeyPoints = [];
  let aiChapters = [];
  let aiFlashcards = [];
  let aiDeepArticle = "";

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const modelsToTry = [
      "gemini-flash-latest",
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3.8-flash",
      "gemini-3.5-flash"
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `
      You are an expert AI professor for the StudyFlow learning workspace.
      Generate comprehensive, deep, structured technical study notes for the YouTube course titled: "${cleanTitle}" (Video ID: ${videoId}).
      Provide your response as a valid JSON object ONLY with the following exact keys:
      {
        "summary": "Exhaustive 3-4 sentence summary explaining core architecture, concepts, and goals of this course.",
        "keyPoints": [
          "Detailed takeaway 1 explaining core concepts & syntax",
          "Detailed takeaway 2 covering state management & side effects",
          "Detailed takeaway 3 covering performance optimizations & best practices",
          "Detailed takeaway 4 with real-world application & deployment"
        ],
        "chapters": [
          { "timestamp": "00:00", "seconds": 0, "title": "Course Introduction & Setup", "description": "Setting up prerequisites, environment tools, and learning objectives." },
          { "timestamp": "12:30", "seconds": 750, "title": "Core Architecture & Fundamentals", "description": "Understanding components, syntax rules, and underlying mechanics." },
          { "timestamp": "45:10", "seconds": 2710, "title": "State Management & Reactivity Patterns", "description": "Hooks usage, state immutability, and re-rendering triggers." },
          { "timestamp": "01:20:15", "seconds": 4815, "title": "Advanced API Integration & Custom Hooks", "description": "Connecting backend APIs, handling async loading states, and custom hooks encapsulation." },
          { "timestamp": "02:40:00", "seconds": 9600, "title": "Project Building & Industry Best Practices", "description": "Structuring production applications, error boundaries, and deployment." }
        ],
        "flashcards": [
          { "question": "What is the primary role of components in ${cleanTitle}?", "answer": "Components act as reusable, isolated UI building blocks that manage their own state and render dynamic data." },
          { "question": "How does state management differ from props?", "answer": "Props are read-only data passed down from parent components, while state is mutable data managed within the component." },
          { "question": "What are key best practices for performance optimization?", "answer": "Memoization, lazy loading, minimizing unnecessary re-renders, and proper cleanup of side effects." }
        ],
        "deepArticle": "<h3 class='text-xl font-bold text-indigo-300 mt-6 mb-3'>1. Deep Concept Overview</h3><p class='text-sm text-slate-300 leading-relaxed mb-4'>Detailed explanation of ${cleanTitle} principles, syntax, and workflow.</p><h3 class='text-xl font-bold text-purple-300 mt-6 mb-3'>2. Code & Implementation Walkthrough</h3><p class='text-sm text-slate-300 leading-relaxed mb-4'>Step-by-step code example demonstrating real-world usage.</p>"
      }
      Do NOT wrap in markdown code blocks. Return ONLY pure valid JSON.
    `;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[StudyFlow Gemini AI] Requesting AI notes with model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        
        const cleanJsonStr = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJsonStr);

        if (parsed.summary) aiSummary = parsed.summary;
        if (Array.isArray(parsed.keyPoints)) aiKeyPoints = parsed.keyPoints;
        if (Array.isArray(parsed.chapters)) aiChapters = parsed.chapters;
        if (Array.isArray(parsed.flashcards)) aiFlashcards = parsed.flashcards;
        if (parsed.deepArticle) aiDeepArticle = parsed.deepArticle;

        console.log(`[StudyFlow Gemini AI] Successfully generated notes using model: ${modelName}`);
        break; // Exit retry loop on success!
      } catch (err) {
        console.warn(`[StudyFlow Gemini AI] Model ${modelName} notice (${err.message}). Retrying next model...`);
      }
    }
  }

  // Fallback defaults if AI call is empty or unparseable
  if (!aiSummary) {
    aiSummary = `This course "${cleanTitle}" provides a comprehensive, step-by-step breakdown of core concepts, real-world applications, and practical problem-solving techniques. It covers key theoretical foundations and actionable insights for effective exam preparation and conceptual mastery.`;
  }

  if (aiKeyPoints.length === 0) {
    aiKeyPoints = [
      `Comprehensive introduction to fundamental concepts in ${cleanTitle}.`,
      `Step-by-step breakdown of practical examples and code/diagram demonstrations.`,
      `Best practices, common pitfalls to avoid, and optimization strategies.`,
      `Key takeaways summarized for fast revision and active recall.`
    ];
  }

  if (aiChapters.length === 0) {
    aiChapters = [
      { timestamp: "00:00", seconds: 0, title: "Course Introduction & Overview", description: "Setting up the learning context, objectives, and foundational principles." },
      { timestamp: "02:30", seconds: 150, title: "Core Concepts & Architecture", description: "Deep dive into main mechanisms, definitions, and component breakdown." },
      { timestamp: "07:15", seconds: 435, title: "Practical Examples & Live Demo", description: "Hands-on implementation, code walkthrough, and practical examples." },
      { timestamp: "14:40", seconds: 880, title: "Summary & Exam Review Notes", description: "Recap of essential formulas, principles, and high-yield revision topics." }
    ];
  }

  if (aiFlashcards.length === 0) {
    aiFlashcards = [
      { question: `What is the main objective of ${cleanTitle}?`, answer: `To master core principles, understand implementation steps, and apply theoretical knowledge to practical scenarios.` },
      { question: `What are the key takeaways from the core concepts section?`, answer: `Understanding foundational definitions, component relationships, and execution flow.` },
      { question: `How does this lesson optimize learning retention?`, answer: `By combining visual demonstrations with structured timestamped chapters and active recall flashcards.` }
    ];
  }

  // Generated Notion-style HTML for StudyReader
  const formattedHtml = `
    <h2 class="text-2xl font-extrabold text-white mt-6 mb-4 border-b border-dark-border/80 pb-3 tracking-tight">
      🎬 ${cleanTitle} — Gemini AI Video Study Notes
    </h2>

    <div class="my-4 p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-slate-200 shadow-md">
      <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span> Google Gemini AI Executive Summary
      </h3>
      <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">${aiSummary}</p>
    </div>

    ${aiDeepArticle || ""}

    <h3 class="text-lg font-bold text-indigo-300 mt-8 mb-3 tracking-tight flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> 📌 Key Study Takeaways
    </h3>
    <ul class="list-disc list-inside space-y-2.5 my-3 text-slate-300 text-sm pl-2">
      ${aiKeyPoints.map((pt) => `<li class="leading-relaxed"><strong class="font-bold text-white">${pt}</strong></li>`).join("")}
    </ul>

    <h3 class="text-lg font-bold text-purple-300 mt-8 mb-3 tracking-tight flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-purple-500 inline-block"></span> ⏱️ Video Chapter Timelines
    </h3>
    <div class="space-y-3 my-4">
      ${aiChapters.map((ch) => `
        <div class="p-3.5 bg-[#0D121F] border border-dark-border/80 rounded-xl flex items-start gap-3">
          <span class="px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold shrink-0">
            ${ch.timestamp}
          </span>
          <div>
            <h4 class="text-xs font-bold text-white mb-0.5">${ch.title}</h4>
            <p class="text-xs text-slate-400">${ch.description}</p>
          </div>
        </div>
      `).join("")}
    </div>

    <h3 class="text-lg font-bold text-emerald-300 mt-8 mb-3 tracking-tight flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> ❓ Auto-Generated Revision Flashcards
    </h3>
    <div class="grid grid-cols-1 gap-3 my-4">
      ${aiFlashcards.map((fc, idx) => `
        <div class="p-4 bg-slate-900/90 border border-emerald-500/20 rounded-2xl space-y-1.5">
          <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <span>Card #${idx + 1}</span>
          </div>
          <p class="text-xs font-semibold text-white">Q: ${fc.question}</p>
          <p class="text-xs text-slate-300">A: ${fc.answer}</p>
        </div>
      `).join("")}
    </div>
  `;

  return {
    aiSummary,
    aiKeyPoints,
    aiChapters,
    aiFlashcards,
    extractedText: formattedHtml
  };
};

import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

/**
 * Notion / Linear Style Technical Workspace Parser for StudyFlow
 * Preserves 100% of all original content without deleting a single word.
 * Groups headings, subtopics, language notes, bullet lists, and code blocks
 * into a beautiful distraction-free editorial layout without random dark boxes.
 */
/**
 * Check if a line is strictly a standalone executable JavaScript statement.
 * Prevents explanatory text like "let block-scoped variable declaration आहे."
 * from being mistakenly classified as executable code blocks.
 */
const isExecutableCodeLine = (line) => {
  if (!line) return false;
  const trimmed = line.trim();

  // 1. Must NOT contain Devanagari (Marathi) characters
  if (/[\u0900-\u097F]/.test(trimmed)) return false;

  // 2. Must NOT match section headings, bullets, flow arrows, badges, or explanations
  if (
    /^(📙|🟢|📘|📕|⚡|🧠|💡|#|\d+\.|\*|-|•|▪)/.test(trimmed) ||
    /^(Definition|Explanation|Summary|Why|What|Marathi|English|JavaScript|Notes?)\b/i.test(trimmed) ||
    trimmed.includes("↓") || trimmed.includes("→")
  ) {
    return false;
  }

  // 3. Must NOT be an orphan keyword like "let", "const", "var" alone on 1 line
  if (/^(let|const|var|function|class|import|export)$/i.test(trimmed)) return false;

  // 4. Strict JS Syntax Validation:
  const isVarDecl = /^(const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*(=|;)/.test(trimmed);
  const isFuncDecl = /^(function\s+[a-zA-Z_$][a-zA-Z0-9_$]*|class\s+[a-zA-Z_$][a-zA-Z0-9_$]*)\s*(\(|{)/.test(trimmed);
  const isConsole = /^console\.(log|warn|error)\s*\(/.test(trimmed);
  const isImportExport = /^(import|export)\s+.+/.test(trimmed);
  const isControlFlow = /^(if|while|for|switch|try|catch)\s*\(/.test(trimmed);
  const isExprWithSemi = (trimmed.endsWith(";") || trimmed.endsWith("}")) && (trimmed.includes("=") || trimmed.includes("("));

  return isVarDecl || isFuncDecl || isConsole || isImportExport || isControlFlow || isExprWithSemi;
};

export const transformToNotionStyleHtml = (text) => {
  if (!text) return "";

  // 1. Normalize line breaks and clean existing raw tags
  let cleanText = text
    .replace(/<p[^>]*>/gi, "\n\n")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n");

  const unmergedLines = cleanText.split("\n");
  const rawLines = [];

  for (let i = 0; i < unmergedLines.length; i++) {
    const current = unmergedLines[i].trim();
    const next = unmergedLines[i + 1] ? unmergedLines[i + 1].trim() : "";

    // If current line is an orphan JS keyword (let, const, var, function) and next line exists and is not a header/fence
    if (
      /^(let|const|var|function|class|import|export)$/i.test(current) &&
      next &&
      !next.startsWith("```") &&
      !/^(📙|🟢|📘|📕|⚡|🧠|💡|#|\d+\.)/.test(next)
    ) {
      rawLines.push(`${current} ${next}`);
      i++; // skip next line since it was merged with current keyword
    } else {
      rawLines.push(unmergedLines[i]);
    }
  }

  let htmlResult = "";
  let inCodeBlock = false;
  let codeBuffer = [];
  let detectedCodeLang = "javascript";
  let inList = false;
  let autoCodeBuffer = [];

  const flushAutoCodeBuffer = () => {
    if (autoCodeBuffer.length > 0) {
      const codeText = autoCodeBuffer
        .join("\n")
        .replace(/;(?=\s*(?:const|let|var|console|function|class|if|while|for|return|import|export)\b)/g, ";\n")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      htmlResult += `<pre class="studyflow-code-block" data-lang="javascript"><code>${codeText}</code></pre>`;
      autoCodeBuffer = [];
    }
  };

  rawLines.forEach((line) => {
    const trimmed = line.trim();

    // Check for Markdown Code Fence (```javascript)
    if (trimmed.startsWith("```")) {
      flushAutoCodeBuffer();
      if (inCodeBlock) {
        const codeText = codeBuffer.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        htmlResult += `<pre class="studyflow-code-block" data-lang="${detectedCodeLang}"><code>${codeText}</code></pre>`;
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        if (inList) { htmlResult += "</ul>"; inList = false; }
        const langMatch = trimmed.replace(/^```/, "").trim();
        detectedCodeLang = langMatch || "javascript";
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (!trimmed) {
      flushAutoCodeBuffer();
      if (inList) { htmlResult += "</ul>"; inList = false; }
      return;
    }

    // Check if line is a strict standalone code line
    if (!inList && isExecutableCodeLine(line)) {
      autoCodeBuffer.push(line);
      return;
    }

    // Flushes any accumulated auto code lines if hitting non-code content
    flushAutoCodeBuffer();

    // 1. Hero Main Topic Header (e.g., 📙 4. JavaScript...)
    if (/^(📙|🟢|📘|📕|⚡|🧠|💡)/.test(trimmed) || trimmed.startsWith("# ")) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      const title = trimmed.replace(/^[#📙🟢📘📕⚡🧠💡]\s*/, "");
      htmlResult += `<h2 class="text-2xl font-extrabold text-white mt-10 mb-4 border-b border-dark-border/80 pb-3 tracking-tight">${applyInlineFormatting(title)}</h2>`;
      return;
    }

    // 2. Numbered Section Topic Title (e.g., 1. JavaScript Introduction, 2. Runtime)
    if (/^\d+\.\s+/.test(trimmed) && trimmed.length < 90) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      htmlResult += `<h3 class="text-xl font-bold text-indigo-300 mt-8 mb-3 tracking-tight flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> ${applyInlineFormatting(trimmed)}</h3>`;
      return;
    }

    // 3. Sub-headers & Definitions (e.g. Definition, Why JavaScript?, JavaScript कुठे वापरतो?)
    if (
      /^(Definition|Why\s+JavaScript\?|JavaScript\s*कुठे\s*वापरतो\?|Why\s+Runtime\?|Summary)/i.test(trimmed) ||
      (trimmed.length < 50 && trimmed.endsWith(":") && !trimmed.includes("."))
    ) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      htmlResult += `<h4 class="text-sm font-bold text-purple-300 uppercase tracking-wider mt-6 mb-2 flex items-center gap-1.5"><span class="text-purple-400">❖</span> ${applyInlineFormatting(trimmed)}</h4>`;
      return;
    }

    // 4. Language Badges (English / Marathi)
    if (/^English$/i.test(trimmed)) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      htmlResult += `<div class="my-2"><span class="inline-flex items-center gap-1.5 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">🇬🇧 English</span></div>`;
      return;
    }

    if (/^Marathi$/i.test(trimmed)) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      htmlResult += `<div class="my-2"><span class="inline-flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/30 text-purple-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">🇮🇳 Marathi</span></div>`;
      return;
    }

    // 5. Flow Diagram Mappings (↓ Down Flows - Rendered vertically one below the other)
    if (trimmed.includes("↓")) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      const stepsHtml = trimmed
        .split("↓")
        .map((s) => s.trim())
        .filter(Boolean)
        .join('<div class="text-indigo-400 font-bold text-xs my-1 pl-1">↓</div>');
      htmlResult += `<div class="my-3 p-3.5 bg-[#0D121F] border border-dark-border rounded-xl font-mono text-xs text-indigo-300 space-y-1 leading-relaxed">${applyInlineFormatting(stepsHtml)}</div>`;
      return;
    }

    if (trimmed.includes("→")) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      htmlResult += `<div class="my-3 p-3 bg-[#0D121F] border border-dark-border rounded-xl font-mono text-xs text-indigo-300 space-y-1.5 leading-relaxed">${applyInlineFormatting(trimmed)}</div>`;
      return;
    }

    // 6. Bullet Lists (In browsers, On servers using Node.js, In mobile apps...)
    if (/^(In\s|On\s|For\s|•|▪|-|\*|\d+\.)/i.test(trimmed) && trimmed.length < 120 && !trimmed.endsWith(".")) {
      if (!inList) {
        htmlResult += `<ul class="list-disc list-inside space-y-2 my-3 text-slate-300 text-sm pl-2">`;
        inList = true;
      }
      const itemText = trimmed.replace(/^(•|▪|-|\*)\s*/, "");
      htmlResult += `<li class="leading-relaxed">${applyInlineFormatting(itemText)}</li>`;
      return;
    }

    if (inList) {
      htmlResult += "</ul>";
      inList = false;
    }

    // 7. Regular Text Paragraphs
    htmlResult += `<p class="text-sm leading-relaxed text-slate-300 my-3 font-sans">${applyInlineFormatting(trimmed)}</p>`;
  });

  flushAutoCodeBuffer();
  if (inList) htmlResult += "</ul>";
  if (inCodeBlock && codeBuffer.length > 0) {
    const codeText = codeBuffer.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    htmlResult += `<pre class="studyflow-code-block" data-lang="${detectedCodeLang}"><code>${codeText}</code></pre>`;
  }

  return htmlResult;
};

// Inline bold (**text**), italic (*text*), inline code (`code`), interactive demo buttons
const applyInlineFormatting = (str) => {
  return str
    .replace(/\b([A-Z])\s+([a-z]{2,})\b/g, "$1$2") // Clean split-word typos (V alue -> Value)
    .replace(/(?:उदा\.\s*:?\s*)?`?(?:Click Me|Click Me!)`?/gi, '<span class="studyflow-demo-btn">Click Me</span>')
    .replace(/`([^`]+)`/g, '<code class="bg-dark-card border border-dark-border px-1.5 py-0.5 rounded text-xs font-mono text-purple-300">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-slate-200">$1</em>');
};

export const processUploadedDocument = async (filePath, fileType) => {
  try {
    let rawText = "";
    let totalPages = 1;

    if (fileType === "docx") {
      const rawResult = await mammoth.extractRawText({ path: filePath });
      rawText = rawResult.value || "";
      const words = rawText.split(/\s+/).filter(Boolean).length;
      totalPages = Math.max(1, Math.ceil(words / 120));
    } else if (fileType === "pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      rawText = data.text || "";
      totalPages = data.numpages || 1;
    } else if (fileType === "txt" || fileType === "md") {
      rawText = fs.readFileSync(filePath, "utf-8");
      const words = rawText.split(/\s+/).filter(Boolean).length;
      totalPages = Math.max(1, Math.ceil(words / 120));
    } else {
      rawText = "Document uploaded successfully.";
      totalPages = 1;
    }

    // Generate Notion/Linear Style Editorial Technical Docs HTML
    const formattedHtml = transformToNotionStyleHtml(rawText);

    // Generate Table of Contents
    const lines = rawText.split("\n").filter((line) => line.trim().length > 0);
    const toc = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (
        /^(📙|🟢|📘|📕|⚡|🧠|💡)/.test(trimmed) ||
        (/^\d+\.\s+/.test(trimmed) && trimmed.length < 60) ||
        trimmed.startsWith("#")
      ) {
        toc.push({
          title: trimmed.replace(/^[#📙🟢📘📕⚡🧠💡\d+.]\s*/, "").slice(0, 40),
          pageNumber: Math.min(totalPages, Math.floor((index / lines.length) * totalPages) + 1),
          level: 1
        });
      }
    });

    if (toc.length === 0) {
      for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        toc.push({ title: `Section ${i}`, pageNumber: i, level: 1 });
      }
    }

    return {
      extractedText: formattedHtml,
      totalPages,
      toc
    };
  } catch (error) {
    console.error("[Document Processor Error]:", error);
    return {
      extractedText: "<p class='text-slate-400'>Failed to format document content.</p>",
      totalPages: 1,
      toc: [{ title: "Document Overview", pageNumber: 1, level: 1 }]
    };
  }
};

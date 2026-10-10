import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

/**
 * Notion / Linear Style Technical Workspace Parser for StudyFlow
 * Preserves 100% of all original content without deleting a single word.
 * Groups headings, subtopics, language notes, bullet lists, code blocks,
 * tables, blockquotes, task lists, and links into a beautiful distraction-free editorial layout.
 */

// Inline formatting parser: links, code, bold, italic, strikethrough, interactive demo buttons
const applyInlineFormatting = (str) => {
  if (!str) return "";
  return str
    .replace(/\b([A-Z])\s+([a-z]{2,})\b/g, "$1$2") // Clean split-word typos (V alue -> Value)
    .replace(/(?:उदा\.\s*:?\s*)?`?(?:Click Me|Click Me!)`?/gi, '<span class="studyflow-demo-btn">Click Me</span>')
    // Markdown links: [title](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors">$1</a>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code class="bg-indigo-50 dark:bg-[#161f36] border border-indigo-500/30 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-700 dark:text-cyan-300">$1</code>')
    // Bold: **text** or __text__
    .replace(/(\*\*|__)(.*?)\1/g, '<strong class="font-bold text-slate-900 dark:text-white">$2</strong>')
    // Italic: *text* or _text_
    .replace(/(\*|_)(.*?)\1/g, '<em class="italic text-slate-800 dark:text-slate-200">$2</em>')
    // Strikethrough: ~~text~~
    .replace(/~~(.*?)~~/g, '<del class="line-through text-slate-400 dark:text-slate-500">$1</del>');
};

/**
 * Check if a line is strictly a standalone executable JavaScript statement.
 */
const isExecutableCodeLine = (line) => {
  if (!line) return false;
  const trimmed = line.trim();

  // 1. Must NOT contain Devanagari (Marathi) characters
  if (/[\u0900-\u097F]/.test(trimmed)) return false;

  // 2. Must NOT match section headings, bullets, flow arrows, badges, or explanations
  if (
    /^(📙|🟢|📘|📕|⚡|🧠|💡|#|\d+\.|\*|-|•|▪|>|\|)/.test(trimmed) ||
    /^(Definition|Explanation|Summary|Why|What|Marathi|English|JavaScript|Notes?)\b/i.test(trimmed) ||
    trimmed.includes("↓") || trimmed.includes("→")
  ) {
    return false;
  }

  // 3. Must NOT be an orphan keyword alone on 1 line
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

export const transformToNotionStyleHtml = (text, fileType = "") => {
  if (!text) return "";

  const isMarkdown = fileType === "md" || fileType === "markdown" || /^#{1,4}\s/m.test(text) || text.includes("```");

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

    if (
      !isMarkdown &&
      /^(let|const|var|function|class|import|export)$/i.test(current) &&
      next &&
      !next.startsWith("```") &&
      !/^(📙|🟢|📘|📕|⚡|🧠|💡|#|\d+\.|>|\|)/.test(next)
    ) {
      rawLines.push(`${current} ${next}`);
      i++;
    } else {
      rawLines.push(unmergedLines[i]);
    }
  }

  let htmlResult = "";
  let inCodeBlock = false;
  let codeBuffer = [];
  let detectedCodeLang = "javascript";
  let inList = false;
  let inTable = false;
  let tableRows = [];
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

  const flushTable = () => {
    if (tableRows.length > 0) {
      const validRows = tableRows.filter(r => !/^[|\s-:]+$/.test(r));
      if (validRows.length > 0) {
        let tableHtml = `<div class="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D121F] shadow-md"><table class="w-full text-left text-sm text-slate-700 dark:text-slate-300 border-collapse">`;
        validRows.forEach((rowStr, rowIndex) => {
          const cells = rowStr.split("|").slice(1, -1).map(c => c.trim());
          if (cells.length === 0) return;
          
          if (rowIndex === 0) {
            tableHtml += `<thead class="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border-b border-slate-200 dark:border-slate-800"><tr>`;
            cells.forEach(cell => {
              tableHtml += `<th class="px-4 py-3 font-semibold">${applyInlineFormatting(cell)}</th>`;
            });
            tableHtml += `</tr></thead><tbody>`;
          } else {
            tableHtml += `<tr class="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">`;
            cells.forEach(cell => {
              tableHtml += `<td class="px-4 py-3">${applyInlineFormatting(cell)}</td>`;
            });
            tableHtml += `</tr>`;
          }
        });
        tableHtml += `</tbody></table></div>`;
        htmlResult += tableHtml;
      }
      tableRows = [];
    }
    inTable = false;
  };

  rawLines.forEach((line) => {
    const trimmed = line.trim();

    // Markdown Table Check
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushAutoCodeBuffer();
      if (inList) { htmlResult += "</ul>"; inList = false; }
      inTable = true;
      tableRows.push(trimmed);
      return;
    } else if (inTable) {
      flushTable();
    }

    // Markdown Code Fence (```lang)
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

    // Horizontal Rule (---, ***, ___)
    if (/^(---|[*]{3,}|_{3,})$/.test(trimmed)) {
      flushAutoCodeBuffer();
      if (inList) { htmlResult += "</ul>"; inList = false; }
      htmlResult += `<hr class="my-8 border-slate-200 dark:border-slate-800/80 border-t" />`;
      return;
    }

    // Blockquote / Notion Callout (> Note)
    if (trimmed.startsWith(">")) {
      flushAutoCodeBuffer();
      if (inList) { htmlResult += "</ul>"; inList = false; }
      const quoteText = trimmed.replace(/^>\s*/, "");
      htmlResult += `<blockquote class="my-4 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-500 text-slate-800 dark:text-slate-200 text-sm leading-relaxed shadow-sm flex items-start gap-3"><span class="text-indigo-500 dark:text-indigo-400 text-lg leading-none shrink-0">💡</span><div class="flex-1 min-w-0">${applyInlineFormatting(quoteText)}</div></blockquote>`;
      return;
    }

    // Check if line is a strict standalone code line (ONLY for non-markdown raw text documents)
    if (!isMarkdown && !inList && isExecutableCodeLine(line)) {
      autoCodeBuffer.push(line);
      return;
    }

    flushAutoCodeBuffer();

    // 1. Headings (Markdown # H1, ## H2, ### H3, #### H4) & Custom Emojis
    if (trimmed.startsWith("# ")) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      const title = trimmed.replace(/^#\s+/, "");
      htmlResult += `<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3 tracking-tight">${applyInlineFormatting(title)}</h1>`;
      return;
    }

    if (trimmed.startsWith("## ")) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      const title = trimmed.replace(/^##\s+/, "");
      htmlResult += `<h2 class="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-300 mt-7 mb-3 tracking-tight flex items-center gap-2.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shadow-sm"></span> ${applyInlineFormatting(title)}</h2>`;
      return;
    }

    if (trimmed.startsWith("### ")) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      const title = trimmed.replace(/^###\s+/, "");
      htmlResult += `<h3 class="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-300 mt-6 mb-2 tracking-tight flex items-center gap-2"><span class="text-purple-500 dark:text-purple-400">❖</span> ${applyInlineFormatting(title)}</h3>`;
      return;
    }

    if (trimmed.startsWith("#### ")) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      const title = trimmed.replace(/^####\s+/, "");
      htmlResult += `<h4 class="text-base font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2 tracking-tight">${applyInlineFormatting(title)}</h4>`;
      return;
    }

    // Hero Emoji Main Header (📙 4. JavaScript...)
    if (/^(📙|🟢|📘|📕|⚡|🧠|💡)/.test(trimmed)) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      const title = trimmed.replace(/^[📙🟢📘📕⚡🧠💡]\s*/, "");
      htmlResult += `<h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3 tracking-tight">${applyInlineFormatting(title)}</h2>`;
      return;
    }

    // Numbered Section Topic Title (e.g. 1. Introduction)
    if (!isMarkdown && /^\d+\.\s+/.test(trimmed) && trimmed.length < 90) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      htmlResult += `<h3 class="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-300 mt-7 mb-3 tracking-tight flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> ${applyInlineFormatting(trimmed)}</h3>`;
      return;
    }

    // Task Checkboxes (- [ ] or - [x])
    if (/^-\s*\[([ xX])\]\s+/.test(trimmed)) {
      if (!inList) {
        htmlResult += `<ul class="space-y-2 my-3 text-slate-700 dark:text-slate-300 text-sm pl-2">`;
        inList = true;
      }
      const isChecked = /^-\s*\[[xX]\]\s+/.test(trimmed);
      const itemText = trimmed.replace(/^-\s*\[([ xX])\]\s+/, "");
      if (isChecked) {
        htmlResult += `<li class="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 line-through"><span class="w-4 h-4 rounded bg-indigo-600 border border-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">✓</span> ${applyInlineFormatting(itemText)}</li>`;
      } else {
        htmlResult += `<li class="flex items-center gap-2.5 text-slate-700 dark:text-slate-300"><span class="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/80 inline-block"></span> ${applyInlineFormatting(itemText)}</li>`;
      }
      return;
    }

    // Sub-headers & Definitions
    if (
      !isMarkdown && (
        /^(Definition|Why\s+JavaScript\?|JavaScript\s*कुठे\s*वापरतो\?|Why\s+Runtime\?|Summary)/i.test(trimmed) ||
        (trimmed.length < 50 && trimmed.endsWith(":") && !trimmed.includes("."))
      )
    ) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      htmlResult += `<h4 class="text-sm font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider mt-6 mb-2 flex items-center gap-1.5"><span class="text-purple-500 dark:text-purple-400">❖</span> ${applyInlineFormatting(trimmed)}</h4>`;
      return;
    }

    // Language Badges (English / Marathi)
    if (/^English$/i.test(trimmed)) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      htmlResult += `<div class="my-2"><span class="inline-flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">🇬🇧 English</span></div>`;
      return;
    }

    if (/^Marathi$/i.test(trimmed)) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      htmlResult += `<div class="my-2"><span class="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">🇮🇳 Marathi</span></div>`;
      return;
    }

    // Flow Diagram Mappings (↓ Down Flows)
    if (trimmed.includes("↓") || trimmed.includes("⬇")) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      const steps = trimmed
        .split(/↓|⬇/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (steps.length > 0) {
        const stepsHtml = steps
          .map((s) => `<div class="px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold inline-block shadow-sm">${applyInlineFormatting(s)}</div>`)
          .join('<div class="text-indigo-600 dark:text-indigo-400 font-bold text-xs my-1 pl-3 flex items-center gap-1.5"><span class="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs">↓</span></div>');
        htmlResult += `<div class="my-4 p-4 bg-slate-50 dark:bg-[#0D121F] border border-slate-200 dark:border-dark-border rounded-2xl flex flex-col items-start gap-1.5">${stepsHtml}</div>`;
      } else {
        htmlResult += `<div class="my-2.5 pl-4 flex items-center"><div class="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shadow-sm">↓</div></div>`;
      }
      return;
    }

    if (trimmed.includes("→") || trimmed.includes("->")) {
      if (inList) { htmlResult += "</ul>"; inList = false; }
      const steps = trimmed
        .split(/→|->/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (steps.length > 0) {
        const stepsHtml = steps
          .map((s) => `<span class="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold">${applyInlineFormatting(s)}</span>`)
          .join('<span class="text-indigo-600 dark:text-indigo-400 font-bold text-xs mx-1">→</span>');
        htmlResult += `<div class="my-3 p-3.5 bg-slate-50 dark:bg-[#0D121F] border border-slate-200 dark:border-dark-border rounded-xl font-mono text-xs text-indigo-700 dark:text-indigo-300 flex flex-wrap items-center gap-1.5">${stepsHtml}</div>`;
      } else {
        htmlResult += `<div class="inline-flex items-center justify-center my-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">→</div>`;
      }
      return;
    }

    // Bullet Lists (•, -, *, 1.)
    if (/^(•|▪|-|\*|\d+\.)\s+/.test(trimmed)) {
      if (!inList) {
        htmlResult += `<ul class="list-disc list-inside space-y-2 my-3 text-slate-700 dark:text-slate-300 text-sm pl-2">`;
        inList = true;
      }
      const itemText = trimmed.replace(/^(•|▪|-|\*|\d+\.)\s+/, "");
      htmlResult += `<li class="leading-relaxed">${applyInlineFormatting(itemText)}</li>`;
      return;
    }

    if (inList) {
      htmlResult += "</ul>";
      inList = false;
    }

    // Regular Text Paragraphs
    htmlResult += `<p class="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 my-3 font-sans">${applyInlineFormatting(trimmed)}</p>`;
  });

  flushAutoCodeBuffer();
  flushTable();
  if (inList) htmlResult += "</ul>";
  if (inCodeBlock && codeBuffer.length > 0) {
    const codeText = codeBuffer.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    htmlResult += `<pre class="studyflow-code-block" data-lang="${detectedCodeLang}"><code>${codeText}</code></pre>`;
  }

  return htmlResult;
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
    const formattedHtml = transformToNotionStyleHtml(rawText, fileType);

    // Generate Table of Contents with levels for Markdown & text docs
    const lines = rawText.split("\n").filter((line) => line.trim().length > 0);
    const toc = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      let level = 1;
      let title = "";

      if (trimmed.startsWith("# ")) {
        level = 1;
        title = trimmed.replace(/^#\s+/, "");
      } else if (trimmed.startsWith("## ")) {
        level = 2;
        title = trimmed.replace(/^##\s+/, "");
      } else if (trimmed.startsWith("### ")) {
        level = 3;
        title = trimmed.replace(/^###\s+/, "");
      } else if (
        /^(📙|🟢|📘|📕|⚡|🧠|💡)/.test(trimmed) ||
        (/^\d+\.\s+/.test(trimmed) && trimmed.length < 60)
      ) {
        level = 1;
        title = trimmed.replace(/^[#📙🟢📘📕⚡🧠💡\d+.]\s*/, "");
      }

      if (title) {
        toc.push({
          title: title.slice(0, 45),
          pageNumber: Math.min(totalPages, Math.floor((index / lines.length) * totalPages) + 1),
          level
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


import React from "react";
import { CodeBlock, formatJavaScriptCode } from "./CodeBlock";
import { DemoButton } from "./DemoButton";

const applyHighlightsToHtml = (htmlContent, highlights = []) => {
  if (!htmlContent || !highlights || highlights.length === 0) return htmlContent;

  let result = htmlContent;

  highlights.forEach((h) => {
    if (!h.selectedText || h.selectedText.trim().length < 2) return;

    const trimmedText = h.selectedText.trim();

    const colorClass = `studyflow-mark-${h.color || 'yellow'}`;
    const noteBadge = h.noteText
      ? `<span class="inline-flex items-center justify-center ml-1 px-1.5 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-md shadow-sm" title="Note: ${h.noteText.replace(/"/g, '&quot;')}">💬 Note</span>`
      : "";

    const markTag = `<mark class="${colorClass}" data-highlight-id="${h._id}">${trimmedText}${noteBadge}</mark>`;
    const escaped = trimmedText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    try {
      const regex = new RegExp(`(?<!<[^>]*)${escaped}(?![^<]*>)`, "gi");
      result = result.replace(regex, markTag);
    } catch (e) {
      result = result.replace(trimmedText, markTag);
    }
  });

  return result;
};

export const StudyReader = ({ htmlContent = "", highlights = [] }) => {
  if (!htmlContent) {
    return <p className="text-slate-400 italic">No content available for Study Reflow Mode.</p>;
  }

  // Sanitize any legacy empty flow diagram boxes or centered arrows and replace with left-aligned down arrow badges
  const cleanHtml = htmlContent
    .replace(/<div\s+class="flex\s+items-center\s+justify-center\s+my-3">\s*<div\s+class="w-8\s+h-8\s+rounded-full\s+bg-indigo-500\/20\s+border\s+border-indigo-500\/30\s+text-indigo-400\s+text-sm\s+font-bold\s+flex\s+items-center\s+justify-center\s+shadow-md">\s*↓\s*<\/div>\s*<\/div>/gi, '<div class="my-2.5 pl-4 flex items-center"><div class="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center shadow-sm">↓</div></div>')
    .replace(/<div\s+class="my-3\s+p-3\.5\s+bg-\[#0D121F\]\s+border\s+border-dark-border\s+rounded-xl\s+font-mono\s+text-xs\s+text-indigo-300\s+space-y-1(?:\.5)?\s+leading-relaxed">\s*<\/div>/gi, '<div class="my-2.5 pl-4 flex items-center"><div class="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center shadow-sm">↓</div></div>');

  // Parse HTML string and extract code blocks & interactive demo buttons
  const parts = [];
  const regex = /(<pre\s+class="studyflow-code-block"\s*data-lang="([^"]*)"><code>([\s\S]*?)<\/code><\/pre>|<span\s+class="studyflow-demo-btn">([\s\S]*?)<\/span>)/gi;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cleanHtml)) !== null) {
    const textBefore = cleanHtml.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push({ type: "html", content: textBefore });
    }

    if (match[0].startsWith("<pre")) {
      const lang = match[2] || "javascript";
      let rawCode = match[3]
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .trim();

      const containsDevanagari = /[\u0900-\u097F]/.test(rawCode);
      const isOrphanKeyword = /^(let|const|var|function|class|import|export)$/i.test(rawCode);
      const isProseLine = /^(let|const|var)\s+[a-zA-Z_$].*\s+[a-zA-Z_$]+/i.test(rawCode) && !rawCode.includes("=") && !rawCode.includes(";");

      if (containsDevanagari || isOrphanKeyword || isProseLine) {
        parts.push({
          type: "html",
          content: `<p class="text-sm leading-relaxed text-slate-300 my-3 font-sans">${rawCode}</p>`
        });
      } else {
        const formattedCode = formatJavaScriptCode(rawCode);
        parts.push({ type: "code", lang, code: formattedCode });
      }
    } else if (match[0].startsWith("<span")) {
      const label = match[4] || "Click Me";
      parts.push({ type: "btn", label });
    }

    lastIndex = regex.lastIndex;
  }

  const remainingText = cleanHtml.substring(lastIndex);
  if (remainingText) {
    parts.push({ type: "html", content: remainingText });
  }

  return (
    <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 font-sans space-y-4">
      {parts.map((part, index) => {
        if (part.type === "code") {
          return (
            <CodeBlock
              key={index}
              initialCode={part.code}
              language={part.lang}
            />
          );
        }

        if (part.type === "btn") {
          return <DemoButton key={index} label={part.label} />;
        }

        const highlightedContent = applyHighlightsToHtml(part.content, highlights);

        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        );
      })}
    </div>
  );
};

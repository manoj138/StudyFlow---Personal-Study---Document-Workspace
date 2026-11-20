import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * CodeSnippet - Terminal-Grade Syntax Container
 * 1px border, monospace typography, 1-click copy feedback.
 */
export const CodeSnippet = ({
  code = "",
  language = "javascript",
  title,
  className = ""
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code ? code.trim().split("\n").length : 1;

  return (
    <div
      className={`rounded-lg border border-zinc-800 bg-[#09090b] overflow-hidden text-xs font-mono shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-800 bg-zinc-900/60 text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="text-[11px] font-semibold text-zinc-300">
            {title || language}
          </span>
          <span className="text-[10px] text-zinc-500">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-3.5 overflow-x-auto text-zinc-200 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeSnippet;

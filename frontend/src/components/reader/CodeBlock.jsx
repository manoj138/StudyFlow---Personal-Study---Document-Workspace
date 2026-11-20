import React, { useState, useEffect } from "react";
import { executeJavaScript } from "../../utils/codeRunner";
import {
  Play,
  Copy,
  Check,
  RotateCcw,
  Edit3,
  Eye,
  Terminal,
  AlertTriangle,
  XCircle,
  Code2
} from "lucide-react";

export const formatJavaScriptCode = (codeStr) => {
  if (!codeStr || typeof codeStr !== "string") return "";

  let formatted = codeStr
    .replace(/\{/g, " {\n")
    .replace(/\}/g, "\n}\n")
    .replace(/;/g, ";\n");

  const lines = formatted.split("\n");
  const cleanLines = [];
  let indentLevel = 0;

  lines.forEach((line) => {
    let trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("}")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indent = "  ".repeat(indentLevel);
    cleanLines.push(`${indent}${trimmed}`);

    if (trimmed.endsWith("{")) {
      indentLevel++;
    }
  });

  return cleanLines.join("\n");
};

export const CodeBlock = ({ initialCode = "", language = "javascript", title = "" }) => {
  const isJs = ["javascript", "js", "jsx"].includes(language.toLowerCase());
  const formattedInitial = isJs ? formatJavaScriptCode(initialCode) : initialCode;
  const [code, setCode] = useState(formattedInitial);
  const [activeLang, setActiveLang] = useState(language.toLowerCase());
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [activeTab, setActiveTab] = useState("code"); // "code" or "preview"

  useEffect(() => {
    const isLangJs = ["javascript", "js", "jsx"].includes(language.toLowerCase());
    setCode(isLangJs ? formatJavaScriptCode(initialCode) : initialCode);
    setActiveLang(language.toLowerCase());
  }, [initialCode, language]);

  const isExecutable = ["javascript", "js", "jsx"].includes(activeLang);
  const isHtmlCss = ["html", "css"].includes(activeLang);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    const isLangJs = ["javascript", "js", "jsx"].includes(activeLang);
    setCode(isLangJs ? formatJavaScriptCode(initialCode) : initialCode);
    setOutput(null);
  };

  const handleRun = async () => {
    if (!isExecutable) return;
    setIsRunning(true);
    const result = await executeJavaScript(code);
    setOutput(result);
    setIsRunning(false);
  };

  const lines = code.split("\n");

  return (
    <div className="my-5 rounded-lg border border-white/[0.08] bg-[#0c0d14] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_24px_-4px_rgba(0,0,0,0.7)] overflow-hidden font-mono text-xs">
      {/* MacOS Terminal Window Bar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-[#11121c] border-b border-white/[0.06] gap-2">
        {/* Left: Window Controls + Language Selector */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] opacity-80" />
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/[0.08] text-zinc-300">
            <select
              value={activeLang}
              onChange={(e) => setActiveLang(e.target.value)}
              className="bg-transparent text-[11px] font-mono text-zinc-300 focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              <option value="javascript" className="bg-[#121215] text-white">JavaScript</option>
              <option value="jsx" className="bg-[#121215] text-white">JSX / React</option>
              <option value="html" className="bg-[#121215] text-white">HTML</option>
              <option value="css" className="bg-[#121215] text-white">CSS</option>
              <option value="json" className="bg-[#121215] text-white">JSON</option>
              <option value="python" className="bg-[#121215] text-white">Python</option>
              <option value="sql" className="bg-[#121215] text-white">SQL</option>
              <option value="bash" className="bg-[#121215] text-white">Bash</option>
            </select>
          </div>
          {title && <span className="text-zinc-500 truncate max-w-xs text-[11px] font-sans">{title}</span>}
        </div>

        {/* Right: Actions (Copy, Edit, Reset, Run) */}
        <div className="flex items-center gap-1.5">
          {isHtmlCss && (
            <div className="flex items-center bg-zinc-900 border border-white/[0.08] rounded-md p-0.5 mr-1">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  activeTab === "code" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors ${
                  activeTab === "preview" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Eye size={11} /> Preview
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 text-[11px] cursor-pointer ${
              isEditing ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40" : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
            title="Toggle Edit Mode"
          >
            <Edit3 size={12} />
            <span>{isEditing ? "Editing" : "Edit"}</span>
          </button>

          {code !== initialCode && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2 py-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-white/[0.05] transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              title="Reset Code"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          {isExecutable && (
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-[11px] flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] border border-indigo-400/40 transition-all cursor-pointer active:scale-95"
            >
              <Play size={11} className="fill-current" />
              <span>{isRunning ? "Running..." : "Run"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Editor Body / Preview Body */}
      {activeTab === "preview" && isHtmlCss ? (
        <div className="p-4 bg-white text-zinc-900 rounded-b-lg min-h-[140px]">
          <iframe
            srcDoc={activeLang === "html" ? code : `<style>${code}</style><h1>Preview</h1>`}
            className="w-full h-36 border-none"
            title="Live Preview"
            sandbox="allow-scripts"
          />
        </div>
      ) : (
        <div className="flex font-mono text-xs p-3.5 overflow-x-auto leading-relaxed relative">
          {/* Line Numbers */}
          <div className="select-none text-zinc-600 text-right pr-3.5 border-r border-white/[0.06] shrink-0 font-mono text-[11px]">
            {lines.map((_, i) => (
              <div key={i} className="leading-6">{i + 1}</div>
            ))}
          </div>

          {/* Code Text Area or Syntax Formatted */}
          <div className="pl-3.5 flex-1 overflow-x-auto min-w-0">
            {isEditing ? (
              <textarea
                rows={Math.max(3, lines.length)}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-transparent text-zinc-100 font-mono text-xs outline-none resize-none leading-6 focus:ring-0 border-none p-0"
                spellCheck={false}
              />
            ) : (
              <pre className="font-mono text-xs text-zinc-200 leading-6 whitespace-pre-wrap break-words">
                {lines.map((line, idx) => (
                  <div key={idx} className="min-h-[1.5rem]">
                    {highlightLineSyntax(line) || <span className="text-zinc-200">{line}</span>}
                  </div>
                ))}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Execution Output Console */}
      {output && (
        <div className="border-t border-white/[0.06] bg-[#07080d] p-3 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-zinc-400 border-b border-white/[0.06] pb-1.5 mb-1.5">
            <span className="font-bold flex items-center gap-1.5 text-indigo-400 uppercase tracking-wider text-[10px]">
              <Terminal size={12} /> Execution Output
            </span>
            <div className="flex items-center gap-3 text-[10px] text-zinc-500">
              {output.executionTimeMs > 0 && <span>{output.executionTimeMs}ms</span>}
              <button
                type="button"
                onClick={() => setOutput(null)}
                className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {output.logs && output.logs.length > 0 && (
            <div className="space-y-1">
              {output.logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-1.5 py-0.5 px-2 rounded text-[11px] ${
                    log.type === "warn"
                      ? "bg-amber-500/10 text-amber-300 border-l-2 border-amber-500"
                      : log.type === "error"
                      ? "bg-rose-500/10 text-rose-300 border-l-2 border-rose-500"
                      : "text-zinc-300"
                  }`}
                >
                  {log.type === "warn" && <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />}
                  {log.type === "error" && <XCircle size={12} className="text-rose-400 shrink-0 mt-0.5" />}
                  <span className="whitespace-pre-wrap">{log.text}</span>
                </div>
              ))}
            </div>
          )}

          {output.result !== null && output.result !== undefined && (
            <div className="text-emerald-400 font-mono py-1 px-2 bg-emerald-500/10 rounded text-[11px] border-l-2 border-emerald-500">
              ➜ {output.result}
            </div>
          )}

          {output.error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1 text-[11px]">
              <div className="font-bold flex items-center gap-1 text-rose-400">
                <XCircle size={12} /> Runtime Error
              </div>
              <p className="whitespace-pre-wrap">{output.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function highlightLineSyntax(line) {
  if (typeof line !== "string" || !line) return <span className="text-zinc-200">&nbsp;</span>;

  if (line.trim().startsWith("//")) {
    return <span className="text-zinc-500 italic">{line}</span>;
  }

  const tokenRegex = /(\b(?:const|let|var|function|return|if|else|for|while|import|export|from|async|await|class|try|catch|throw|new|typeof)\b)|("[^"]*"|'[^']*'|`[^`]*`)|(\b\d+\b)/g;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      elements.push(
        <span key={`p_${lastIndex}`} className="text-zinc-200">
          {line.substring(lastIndex, match.index)}
        </span>
      );
    }

    if (match[1]) {
      elements.push(
        <span key={`kw_${match.index}`} className="text-purple-400 font-semibold">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      elements.push(
        <span key={`str_${match.index}`} className="text-emerald-300">
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      elements.push(
        <span key={`num_${match.index}`} className="text-amber-300 font-mono">
          {match[3]}
        </span>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    elements.push(
      <span key={`p_${lastIndex}`} className="text-zinc-200">
        {line.substring(lastIndex)}
      </span>
    );
  }

  return elements.length > 0 ? elements : <span className="text-zinc-200">{line}</span>;
}

export default CodeBlock;

import React, { useState, useEffect } from "react";
import { executeJavaScript } from "../../utils/codeRunner";
import { Play, Copy, Check, RotateCcw, Edit3, Eye, Terminal, AlertTriangle, XCircle, Code2 } from "lucide-react";

export const formatJavaScriptCode = (codeStr) => {
  if (!codeStr || typeof codeStr !== "string") return "";

  // Insert newlines around {, }, and ; if missing
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
  const formattedInitial = formatJavaScriptCode(initialCode);
  const [code, setCode] = useState(formattedInitial);
  const [activeLang, setActiveLang] = useState(language.toLowerCase());
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null); // { logs: [], result: null, error: null, executionTimeMs: 0 }
  const [activeTab, setActiveTab] = useState("code"); // "code" or "preview" (for HTML/CSS)

  useEffect(() => {
    setCode(formatJavaScriptCode(initialCode));
  }, [initialCode]);

  const isExecutable = ["javascript", "js", "jsx"].includes(activeLang);
  const isHtmlCss = ["html", "css"].includes(activeLang);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(formatJavaScriptCode(initialCode));
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
    <div className="my-6 rounded-2xl border border-dark-border bg-[#0D121F] overflow-hidden shadow-2xl transition-all code-block-container">
      {/* Code Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#131926] border-b border-dark-border gap-2 text-xs code-block-header">
        {/* Left: Language Badge & Title */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 uppercase tracking-wider text-[11px]">
            <Code2 className="w-3.5 h-3.5" />
            <select
              value={activeLang}
              onChange={(e) => setActiveLang(e.target.value)}
              className="bg-transparent text-indigo-300 font-mono focus:outline-none cursor-pointer"
            >
              <option value="javascript" className="bg-dark-card text-white">JavaScript</option>
              <option value="jsx" className="bg-dark-card text-white">JSX / React</option>
              <option value="html" className="bg-dark-card text-white">HTML</option>
              <option value="css" className="bg-dark-card text-white">CSS</option>
              <option value="json" className="bg-dark-card text-white">JSON</option>
              <option value="python" className="bg-dark-card text-white">Python</option>
              <option value="sql" className="bg-dark-card text-white">SQL</option>
              <option value="java" className="bg-dark-card text-white">Java</option>
              <option value="cpp" className="bg-dark-card text-white">C / C++</option>
              <option value="bash" className="bg-dark-card text-white">Bash</option>
            </select>
          </div>
          {title && <span className="text-slate-400 font-medium truncate max-w-xs">{title}</span>}
        </div>

        {/* Right: Actions (Copy, Edit, Reset, Run/Preview) */}
        <div className="flex items-center gap-2">
          {isHtmlCss && (
            <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg p-0.5 mr-2">
              <button
                onClick={() => setActiveTab("code")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                  activeTab === "code" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
                  activeTab === "preview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="w-3 h-3" /> Preview
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-card transition-colors flex items-center gap-1 text-[11px]"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
              isEditing ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40" : "text-slate-400 hover:text-white hover:bg-dark-card"
            }`}
            title="Toggle Edit Mode"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? "Editing" : "Edit"}</span>
          </button>

          {code !== initialCode && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1 text-[11px]"
              title="Reset Code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {isExecutable && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-3.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isRunning ? "Running..." : "Run"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Editor Body / Preview Body */}
      {activeTab === "preview" && isHtmlCss ? (
        <div className="p-4 bg-white text-slate-900 rounded-b-2xl min-h-[160px]">
          <iframe
            srcDoc={activeLang === "html" ? code : `<style>${code}</style><h1>HTML/CSS Preview</h1>`}
            className="w-full h-40 border-none"
            title="Live Preview"
            sandbox="allow-scripts"
          />
        </div>
      ) : (
        <div className="flex font-mono text-xs sm:text-sm p-4 overflow-x-auto selection:bg-indigo-500/30 leading-relaxed relative">
          {/* Line Numbers */}
          <div className="select-none text-slate-600 text-right pr-4 border-r border-dark-border/60 shrink-0 font-mono text-xs">
            {lines.map((_, i) => (
              <div key={i} className="leading-6">{i + 1}</div>
            ))}
          </div>

          {/* Code Text Area or Pre formatted */}
          <div className="pl-4 flex-1 overflow-x-auto min-w-0">
            {isEditing ? (
              <textarea
                rows={Math.max(3, lines.length)}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-transparent text-slate-100 font-mono text-xs sm:text-sm outline-none resize-none leading-6 focus:ring-0 border-none p-0"
                spellCheck={false}
              />
            ) : (
              <pre className="font-mono text-xs sm:text-sm text-slate-200 leading-6 whitespace-pre-wrap break-words">
                {lines.map((line, idx) => (
                  <div key={idx} className="min-h-[1.5rem]">
                    {highlightLineSyntax(line) || <span className="text-slate-200">{line}</span>}
                  </div>
                ))}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Interactive Execution Output Console */}
      {output && (
        <div className="border-t border-dark-border bg-[#090D16] p-4 text-xs font-mono space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-slate-400 border-b border-dark-border/50 pb-2 mb-2">
            <span className="font-bold flex items-center gap-1.5 text-indigo-400 uppercase tracking-wider text-[11px]">
              <Terminal className="w-3.5 h-3.5" /> Output Console
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              {output.executionTimeMs > 0 && <span>Executed in {output.executionTimeMs}ms</span>}
              <button
                onClick={() => setOutput(null)}
                className="text-slate-500 hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Console Logs */}
          {output.logs && output.logs.length > 0 && (
            <div className="space-y-1">
              {output.logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 py-1 px-2 rounded font-mono ${
                    log.type === "warn"
                      ? "bg-amber-500/10 text-amber-300 border-l-2 border-amber-500"
                      : log.type === "error"
                      ? "bg-rose-500/10 text-rose-300 border-l-2 border-rose-500"
                      : "text-slate-200"
                  }`}
                >
                  {log.type === "warn" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                  {log.type === "error" && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                  <span className="whitespace-pre-wrap">{log.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Returned Result */}
          {output.result !== null && output.result !== undefined && (
            <div className="text-emerald-400 font-mono py-1 px-2 bg-emerald-500/10 rounded border-l-2 border-emerald-500">
              ➜ {output.result}
            </div>
          )}

          {/* Runtime Error */}
          {output.error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-400">
                <XCircle className="w-4 h-4" /> Runtime Error
              </div>
              <p className="text-xs font-mono whitespace-pre-wrap">{output.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Robust Token Syntax Highlighting Helper with Guaranteed Fallback
function highlightLineSyntax(line) {
  if (typeof line !== "string" || !line) return <span className="code-text-plain text-slate-200">&nbsp;</span>;

  // Comments
  if (line.trim().startsWith("//")) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  // Tokens Regex (Keywords, Strings, Numbers)
  const tokenRegex = /(\b(?:const|let|var|function|return|if|else|for|while|import|export|from|async|await|class|try|catch|throw|new|typeof)\b)|("[^"]*"|'[^']*'|`[^`]*`)|(\b\d+\b)/g;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      elements.push(
        <span key={`p_${lastIndex}`} className="code-text-plain text-slate-200">
          {line.substring(lastIndex, match.index)}
        </span>
      );
    }

    if (match[1]) {
      // Keyword
      elements.push(
        <span key={`kw_${match.index}`} className="code-text-kw text-purple-400 font-bold">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      // String
      elements.push(
        <span key={`str_${match.index}`} className="code-text-str text-emerald-300">
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      // Number
      elements.push(
        <span key={`num_${match.index}`} className="code-text-num text-amber-300">
          {match[3]}
        </span>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    elements.push(
      <span key={`p_${lastIndex}`} className="code-text-plain text-slate-200">
        {line.substring(lastIndex)}
      </span>
    );
  }

  return elements.length > 0 ? elements : <span className="code-text-plain text-slate-200">{line}</span>;
}

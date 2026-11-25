import React, { useState } from "react";
import {
  X,
  Sparkles,
  UploadCloud,
  FileText,
  Calendar,
  Clock,
  Target,
  Loader2,
  CheckCircle2,
  Layers
} from "lucide-react";
import {
  createChallengeFromPrompt,
  createChallengeFromFile,
  seedDemoRoadmap
} from "../../services/challengeService";

export const CreateChallengeModal = ({ isOpen, onClose, onCreated }) => {
  const [activeTab, setActiveTab] = useState("prompt"); // "prompt" | "file"
  const [prompt, setPrompt] = useState("");
  const [syllabusText, setSyllabusText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [durationDays, setDurationDays] = useState(30);
  const [customDays, setCustomDays] = useState("");
  const [dailyHours, setDailyHours] = useState(4);
  const [targetGoal, setTargetGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const dayPresets = [7, 15, 30, 45, 60, 100];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const finalDays = customDays ? parseInt(customDays) : durationDays;
    if (!finalDays || finalDays < 1) {
      setError("Please specify a valid number of days (at least 1).");
      return;
    }

    setLoading(true);

    try {
      setLoadingMessage("Gemini AI is analyzing syllabus structure...");
      let result;

      if (activeTab === "prompt") {
        if (!prompt.trim() && !syllabusText.trim()) {
          setError("Please enter a challenge topic or paste your syllabus content.");
          setLoading(false);
          return;
        }

        const combinedPrompt = syllabusText.trim()
          ? `${prompt.trim()}\n\nDetailed Syllabus:\n${syllabusText.trim()}`
          : prompt.trim();

        result = await createChallengeFromPrompt({
          prompt: combinedPrompt,
          durationDays: finalDays,
          dailyHours,
          targetGoal: targetGoal.trim()
        });
      } else {
        if (!selectedFile) {
          setError("Please select a .pdf, .md, .txt, or .docx file.");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("durationDays", finalDays);
        formData.append("dailyHours", dailyHours);
        if (targetGoal.trim()) formData.append("targetGoal", targetGoal.trim());
        if (prompt.trim()) formData.append("title", prompt.trim());

        result = await createChallengeFromFile(formData);
      }

      if (result?.success) {
        onCreated(result.roadmap);
        onClose();
      } else {
        setError(result?.error || "Failed to generate roadmap challenge.");
      }
    } catch (err) {
      console.error("Create challenge error:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred while generating your roadmap."
      );
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleLoadDemo = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Loading exact 30-Day Developer Roadmap template...");
      setError("");
      const result = await seedDemoRoadmap();
      if (result?.success) {
        onCreated(result.roadmap);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load demo roadmap.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0E1015] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 via-cyan-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                Create Study Challenge Roadmap
              </h3>
              <p className="text-xs text-zinc-400">
                AI generates an interactive day-by-day roadmap with checklists & schedules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Demo Template Banner */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-indigo-950/40 via-cyan-950/30 to-emerald-950/40 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <Layers size={14} className="text-indigo-400" />
            <span>Want the exact roadmap from your image?</span>
          </div>
          <button
            type="button"
            onClick={handleLoadDemo}
            disabled={loading}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition-colors flex items-center gap-1.5"
          >
            <span>Load 30-Day Developer Template</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex p-1 bg-[#141721] rounded-xl border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab("prompt")}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "prompt"
                  ? "bg-indigo-600 text-white shadow-md font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkles size={14} />
              <span>Prompt / Topic</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "file"
                  ? "bg-indigo-600 text-white shadow-md font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <UploadCloud size={14} />
              <span>Upload Syllabus File (.pdf / .md / .txt)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "prompt" ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Challenge Topic / Role Name *
                  </label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. MERN Stack + DSA + Android Roadmap, Python Data Science, DevOps Engineer"
                    className="w-full bg-[#141721] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Custom Syllabus or Notes <span className="text-zinc-500 font-normal">(Optional, paste raw topics or modules)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={syllabusText}
                    onChange={(e) => setSyllabusText(e.target.value)}
                    placeholder="Paste table of contents, modules, or key concepts you want included..."
                    className="w-full bg-[#141721] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Upload Syllabus Document *
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/[0.12] hover:border-indigo-500/50 rounded-2xl p-6 bg-[#141721]/50 cursor-pointer transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform mb-3">
                    <FileText size={24} />
                  </div>
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={14} />
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose another file
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs font-medium text-zinc-200">
                        Click to select or drag & drop syllabus file
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Supports PDF, Markdown (.md), TXT, or DOCX (up to 25 MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.md,.txt,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Custom Challenge Title <span className="text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Android & Kotlin 30 Days Masterclass"
                    className="w-full bg-[#141721] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Target Duration Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Calendar size={13} className="text-indigo-400" />
                  <span>Challenge Duration (Days)</span>
                </label>
                <span className="text-xs font-mono font-semibold text-indigo-400">
                  {customDays ? `${customDays} Days` : `${durationDays} Days`}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {dayPresets.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      setDurationDays(days);
                      setCustomDays("");
                    }}
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                      !customDays && durationDays === days
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold"
                        : "bg-[#141721] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.14]"
                    }`}
                  >
                    {days}d
                  </button>
                ))}
                <div className="col-span-1">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    placeholder="Custom"
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-mono text-center border focus:outline-none ${
                      customDays
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold"
                        : "bg-[#141721] border-white/[0.08] text-zinc-400"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Daily Hours & Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Clock size={13} className="text-cyan-400" />
                  <span>Daily Study Commitment</span>
                </label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value))}
                  className="w-full bg-[#141721] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value={2}>2 Hours / day (Moderate)</option>
                  <option value={4}>4 Hours / day (Focused Study)</option>
                  <option value={6}>6 Hours / day (Intensive Boot camp)</option>
                  <option value={8}>8 Hours / day (Full-time Sprint)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Target size={13} className="text-emerald-400" />
                  <span>Dream Role / Target Goal</span>
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="e.g. SDE-1, Full Stack Developer"
                  className="w-full bg-[#141721] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>{loadingMessage || "Generating Roadmap..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Challenge Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

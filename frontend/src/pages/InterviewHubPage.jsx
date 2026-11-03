import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Plus,
  Play,
  FileText,
  Upload,
  BookOpen,
  Trash2,
  Sparkles,
  Trophy,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  X,
  FileUp,
  Brain,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import API from "../services/api";
import {
  getInterviewSets,
  createInterviewFromText,
  createInterviewFromFile,
  createInterviewFromDocument,
  deleteInterviewSet
} from "../services/interviewService";

export const InterviewHubPage = () => {
  const navigate = useNavigate();

  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTab, setCreateTab] = useState("upload"); // "upload" | "text" | "library"
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [rawText, setRawText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState("");

  // Library Documents for Tab 3
  const [libraryDocs, setLibraryDocs] = useState([]);

  // Preview Questions Modal
  const [previewSet, setPreviewSet] = useState(null);

  useEffect(() => {
    loadInterviewSets();
    loadLibraryDocs();
  }, []);

  const loadInterviewSets = async () => {
    try {
      setLoading(true);
      const res = await getInterviewSets();
      if (res.success) {
        setSets(res.interviewSets || []);
      }
    } catch (err) {
      console.error("Failed to load interview sets:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadLibraryDocs = async () => {
    try {
      const res = await API.get("/documents");
      if (res.data?.success) {
        setLibraryDocs(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load library documents:", err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!title.trim() && createTab !== "upload") {
      setCreateError("Please enter a title for this interview set.");
      return;
    }

    try {
      setSubmitting(true);
      let res;

      if (createTab === "text") {
        if (!rawText.trim()) {
          setCreateError("Please paste some text, notes, or Q&A content.");
          setSubmitting(false);
          return;
        }
        res = await createInterviewFromText({
          title,
          topic: topic || "General",
          rawText
        });
      } else if (createTab === "upload") {
        if (!selectedFile) {
          setCreateError("Please select a PDF, DOCX, TXT, or MD file.");
          setSubmitting(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", title || selectedFile.name.replace(/\.[^/.]+$/, ""));
        formData.append("topic", topic || "General");
        res = await createInterviewFromFile(formData);
      } else if (createTab === "library") {
        if (!selectedDocId) {
          setCreateError("Please select a document from your StudyFlow library.");
          setSubmitting(false);
          return;
        }
        res = await createInterviewFromDocument({
          documentId: selectedDocId,
          title: title || "Document Interview",
          topic: topic || "General"
        });
      }

      if (res?.success) {
        setIsCreateOpen(false);
        resetCreateForm();
        loadInterviewSets();
        // Immediately navigate into the new session
        if (res.interviewSet?._id) {
          navigate(`/interview/${res.interviewSet._id}`);
        }
      } else {
        setCreateError(res?.error || "Failed to create interview set.");
      }
    } catch (err) {
      console.error("Creation error:", err);
      setCreateError(err.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setTitle("");
    setTopic("");
    setRawText("");
    setSelectedFile(null);
    setSelectedDocId("");
    setCreateError("");
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this interview set?")) return;
    try {
      await deleteInterviewSet(id);
      setSets((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Failed to delete interview set:", err);
    }
  };

  // Filtered Sets
  const topics = ["all", ...new Set(sets.map((s) => s.topic).filter(Boolean))];
  const filteredSets = sets.filter((s) => {
    const matchesSearch =
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === "all" || s.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  // Calculate aggregates
  const totalQuestions = sets.reduce((acc, s) => acc + (s.questionCount || 0), 0);
  const bestOverallScore = sets.length > 0 ? Math.max(...sets.map((s) => s.bestScore || 0)) : 0;

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans transition-colors duration-200">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Mic className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            AI Mock Interview Studio
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Interview Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-300">Room</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Upload interview PDFs, Word docs, or notes. StudyFlow asks questions using voice just like a real interviewer — speak into the mic and get instant AI scoring & keyword feedback.
          </p>
        </div>

        <button
          onClick={() => {
            resetCreateForm();
            setIsCreateOpen(true);
          }}
          className="relative z-10 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Interview Set</span>
        </button>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Question Sets
          </span>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-2xl font-black font-mono">{sets.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Total Questions
          </span>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span className="text-2xl font-black font-mono">{totalQuestions}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Best Score
          </span>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-2xl font-black font-mono">{bestOverallScore}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            AI Engine
          </span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Gemini + Voice</span>
          </div>
        </div>
      </div>

      {/* Search & Topic Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search interview sets by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Topic Pills */}
        {topics.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  selectedTopic === t
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sets Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your interview sets...</p>
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl p-10 sm:p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {searchQuery ? "No matching interview sets found" : "No interview sets created yet"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Upload your interview PDF, paste notes, or generate from your existing study documents to start practicing.
            </p>
          </div>
          <button
            onClick={() => {
              resetCreateForm();
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Create First Interview Set
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSets.map((s) => (
            <motion.div
              key={s._id}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header Pills */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {s.topic || "General"}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="font-semibold">{s.questionCount} Qs</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-500 transition-colors">
                  {s.title}
                </h3>

                {/* Score Progress / Past Attempt */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Best Readiness Score:</span>
                    <span
                      className={`font-bold font-mono ${
                        s.bestScore >= 80
                          ? "text-emerald-500"
                          : s.bestScore >= 50
                          ? "text-amber-500"
                          : "text-slate-400"
                      }`}
                    >
                      {s.bestScore ? `${s.bestScore}%` : "Not attempted"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.bestScore >= 80
                          ? "bg-emerald-500"
                          : s.bestScore >= 50
                          ? "bg-amber-500"
                          : "bg-indigo-500"
                      }`}
                      style={{ width: `${s.bestScore || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-5 mt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => navigate(`/interview/${s._id}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Interview</span>
                </button>
                <button
                  onClick={(e) => handleDelete(s._id, e)}
                  title="Delete Set"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Create New Interview */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Create Interview Set
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Auto-extract questions with AI or import your notes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Source Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCreateTab("upload")}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    createTab === "upload"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setCreateTab("text")}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    createTab === "text"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Paste Notes
                </button>
                <button
                  type="button"
                  onClick={() => setCreateTab("library")}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    createTab === "library"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> From Library
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {createError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Set Title {createTab !== "upload" && "*"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React Frontend Deep Dive"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Topic / Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React, Node.js, HR"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Tab 1: Upload File */}
                {createTab === "upload" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Upload Document (PDF, Word, Markdown, Text)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl p-6 text-center hover:border-indigo-500/50 transition-colors">
                      <input
                        type="file"
                        id="interview-file"
                        accept=".pdf,.docx,.txt,.md"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            if (!title) {
                              setTitle(file.name.replace(/\.[^/.]+$/, ""));
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="interview-file" className="cursor-pointer space-y-2 block">
                        <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {selectedFile ? (
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                            </span>
                          ) : (
                            <span>
                              Click to choose a file or drag & drop <br />
                              <span className="text-[10px] text-slate-400">PDF, DOCX, MD, TXT up to 25MB</span>
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Tab 2: Paste Raw Text */}
                {createTab === "text" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Paste Interview Questions & Answers or Notes
                    </label>
                    <textarea
                      rows={7}
                      placeholder="Paste questions here, for example:&#10;Q1: What is the Virtual DOM in React?&#10;Ans: The Virtual DOM is an in-memory representation of real DOM elements...&#10;&#10;Q2: What is the difference between let and const?&#10;Ans: let allows reassignment while const creates immutable bindings."
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Tip: You can paste messy notes or full interview cheat sheets. AI will automatically structure questions, model answers, and expected keywords.
                    </p>
                  </div>
                )}

                {/* Tab 3: Select from Library */}
                {createTab === "library" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Select Document from Library
                    </label>
                    {libraryDocs.length === 0 ? (
                      <p className="text-xs text-slate-400 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                        No documents found in your library yet. Upload a file above or in the Library tab first.
                      </p>
                    ) : (
                      <select
                        value={selectedDocId}
                        onChange={(e) => {
                          setSelectedDocId(e.target.value);
                          const doc = libraryDocs.find((d) => d._id === e.target.value);
                          if (doc && !title) {
                            setTitle(`Interview: ${doc.title}`);
                            setTopic(doc.subjectTitle || "General");
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Choose a document --</option>
                        {libraryDocs.map((doc) => (
                          <option key={doc._id} value={doc._id}>
                            {doc.title} ({doc.fileType?.toUpperCase() || "DOC"})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>AI Parsing Q&A...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Interview</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


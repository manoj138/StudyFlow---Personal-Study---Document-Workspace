import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  Layers,
  Search,
  X,
  Brain,
  HelpCircle
} from "lucide-react";
import API from "../services/api";
import {
  getInterviewSets,
  createInterviewFromText,
  createInterviewFromFile,
  createInterviewFromDocument,
  deleteInterviewSet
} from "../services/interviewService";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  MetricCard,
  PageHeader
} from "../components/ui";

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

  const totalQuestions = sets.reduce((acc, s) => acc + (s.questionCount || 0), 0);
  const bestOverallScore = sets.length > 0 ? Math.max(...sets.map((s) => s.bestScore || 0)) : 0;

  return (
    <div className="min-h-screen bg-[#08090C] text-zinc-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Command Strip */}
      <PageHeader
        breadcrumb="STUDYFLOW // INTERVIEW HUB"
        title="Technical Interview Hub"
        description="Self-study technical interview sets with keyboard-first active recall, standard benchmark answers, and optional voice scoring."
        actions={
          <Button
            variant="indigo"
            size="sm"
            icon={Plus}
            onClick={() => {
              resetCreateForm();
              setIsCreateOpen(true);
            }}
          >
            New Interview Set
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Question Sets"
          value={sets.length}
          subtext="Available Decks"
          icon={Layers}
        />
        <MetricCard
          label="Total Questions"
          value={totalQuestions}
          subtext="Interview Bank"
          icon={HelpCircle}
        />
        <MetricCard
          label="Best Readiness"
          value={`${bestOverallScore}%`}
          subtext="Peak Score"
          icon={Trophy}
        />
        <MetricCard
          label="Evaluation Mode"
          value="Self-Study"
          subtext="+ Optional Mic Drill"
          icon={Mic}
        />
      </div>

      {/* Search & Topic Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search interview sets by title or track..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono"
          />
        </div>

        {topics.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTopic === t
                    ? "bg-zinc-100 text-zinc-950 font-semibold"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
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
        <div className="py-20 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-zinc-500">Loading interview sets...</p>
        </div>
      ) : filteredSets.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-zinc-800 max-w-md mx-auto my-8 space-y-3">
          <div className="w-10 h-10 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60 flex items-center justify-center mx-auto">
            <Brain size={20} />
          </div>
          <CardTitle className="text-sm font-semibold">
            {searchQuery ? "No matching interview sets" : "No interview sets created yet"}
          </CardTitle>
          <CardDescription>
            Upload your technical PDF, paste notes, or load the official MERN guide to start practicing.
          </CardDescription>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              resetCreateForm();
              setIsCreateOpen(true);
            }}
          >
            Create Interview Set
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSets.map((s) => (
            <Card
              key={s._id}
              interactive
              onClick={() => navigate(`/interview/${s._id}`)}
              className="space-y-3 flex flex-col justify-between"
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <Badge variant="neutral" size="sm">
                  {s.topic || "General"}
                </Badge>
                <span className="text-[11px] font-mono text-zinc-500">
                  {s.questionCount} Questions
                </span>
              </CardHeader>

              <CardContent className="space-y-3 py-0">
                <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug">
                  {s.title}
                </h3>

                <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-zinc-500">Readiness Score:</span>
                    <Badge
                      variant={
                        s.bestScore >= 75
                          ? "success"
                          : s.bestScore >= 50
                          ? "warning"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {s.bestScore ? `${s.bestScore}%` : "Unscored"}
                    </Badge>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-zinc-300 transition-all duration-300"
                      style={{ width: `${s.bestScore || 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 flex items-center justify-between gap-2">
                <Button
                  variant="indigo"
                  size="sm"
                  icon={Play}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/interview/${s._id}`);
                  }}
                  className="flex-1"
                >
                  Start Practice
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={(e) => handleDelete(s._id, e)}
                  title="Delete Set"
                  className="hover:text-rose-400"
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create New Interview */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-[#141720] border border-white/[0.12] rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="space-y-0.5">
                  <h2 className="text-base font-semibold text-zinc-100">
                    Create Technical Interview Set
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Generate structured questions and model answers automatically
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={() => setIsCreateOpen(false)}
                />
              </div>

              {/* Source Mode Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-md border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setCreateTab("upload")}
                  className={`py-1.5 rounded-[4px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    createTab === "upload"
                      ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Upload size={13} />
                  <span>File Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateTab("text")}
                  className={`py-1.5 rounded-[4px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    createTab === "text"
                      ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <FileText size={13} />
                  <span>Paste Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateTab("library")}
                  className={`py-1.5 rounded-[4px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    createTab === "library"
                      ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <BookOpen size={13} />
                  <span>From Library</span>
                </button>
              </div>

              {/* Create Form */}
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {createError && (
                  <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                    {createError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Set Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React 19 Server Actions & Hooks"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Topic / Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, System Design"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                {/* Tab 1: File Upload */}
                {createTab === "upload" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                        Upload Document (.md, .pdf, .docx, .txt)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          .MD Ready
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          PDF
                        </span>
                      </div>
                    </div>

                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700/80 hover:border-indigo-500/60 rounded-xl p-5 bg-zinc-950/60 cursor-pointer transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform mb-2">
                        <Upload size={20} />
                      </div>

                      {selectedFile ? (
                        <div className="text-center space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-bold text-zinc-100 line-clamp-1 max-w-[280px]">
                              {selectedFile.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {selectedFile.name.split('.').pop()}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose another file
                          </p>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <p className="text-xs font-semibold text-zinc-200">
                            Click to browse or drop your Markdown or Document file
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            Supports Markdown (<span className="text-emerald-400 font-semibold font-mono">.md</span>), PDF, Word (.docx), and Plain Text (.txt)
                          </p>
                        </div>
                      )}

                      <input
                        type="file"
                        accept=".md,.markdown,text/markdown,text/x-markdown,.pdf,.docx,.doc,.txt,text/plain"
                        onChange={(e) => {
                          const file = e.target.files[0] || null;
                          setSelectedFile(file);
                          if (file && !title) {
                            setTitle(file.name.replace(/\.[^/.]+$/, ""));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Tab 2: Raw Text */}
                {createTab === "text" && (
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      Paste Notes or Interview Q&A Text
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Paste interview questions, study notes, or transcript..."
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono leading-relaxed"
                    />
                  </div>
                )}

                {/* Tab 3: Existing Library Document */}
                {createTab === "library" && (
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      Choose from Library
                    </label>
                    <select
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="">Select a document...</option>
                      {libraryDocs.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          {doc.title} ({doc.fileName || "File"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="indigo"
                    size="sm"
                    loading={submitting}
                  >
                    Generate Interview Set
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewHubPage;

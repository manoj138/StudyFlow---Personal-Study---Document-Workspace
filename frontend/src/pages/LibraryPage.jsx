import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getDocuments, uploadDocument, importYouTubeDocument, deleteDocument } from "../services/documentService";
import API from "../services/api";
import { 
  FileText, Upload, Search, Filter, Trash2, BookOpen, LayoutGrid, List, 
  AlertCircle, ArrowRight, CloudUpload, File, CheckCircle2, X, Sparkles, Plus,
  Youtube, Play, Video, GraduationCap, Library
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "../components/ui/SearchBar";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import { DocumentCard } from "../components/common/DocumentCard";
import { VideoCard } from "../components/common/VideoCard";

import { DocumentScannerLoader } from "../components/common/DocumentScannerLoader";

export const LibraryPage = () => {
  const [searchParams] = useSearchParams();
  const urlSubjectId = searchParams.get("subjectId") || "";

  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(urlSubjectId);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [libraryCategory, setLibraryCategory] = useState("all"); // "all", "documents", "videos"
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (urlSubjectId) {
      setSelectedSubject(urlSubjectId);
    }
  }, [urlSubjectId]);

  // Upload form state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // YouTube Import state
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ytCustomTitle, setYtCustomTitle] = useState("");
  const [ytImporting, setYtImporting] = useState(false);
  const [ytError, setYtError] = useState("");

  const navigate = useNavigate();

  const handleOpenUploadModal = () => {
    setUploadError("");
    if (subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0]._id);
    }
    setShowUploadModal(true);
  };

  const handleOpenYouTubeModal = () => {
    setYtError("");
    if (subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0]._id);
    }
    setShowYouTubeModal(true);
  };

  const handleYouTubeSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setYtError("Please enter a valid YouTube video URL.");
      return;
    }
    if (!subjectId) {
      setYtError("Please select a subject first.");
      return;
    }

    setYtError("");
    setYtImporting(true);

    try {
      const res = await importYouTubeDocument({
        youtubeUrl,
        subjectId,
        customTitle: ytCustomTitle
      });

      if (res.success) {
        setDocuments([res.data, ...documents]);
        setShowYouTubeModal(false);
        setYoutubeUrl("");
        setYtCustomTitle("");
        navigate(`/document/${res.data._id}`);
      }
    } catch (err) {
      setYtError(err.response?.data?.error || "Failed to import YouTube video.");
    } finally {
      setYtImporting(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, [search, selectedSubject]);

  const fetchLibraryData = async () => {
    try {
      const [docsRes, subjRes] = await Promise.all([
        getDocuments({ search, subjectId: selectedSubject }),
        API.get("/subjects")
      ]);

      if (docsRes.success) setDocuments(docsRes.data);
      if (subjRes.data.success) {
        const subjs = subjRes.data.data;
        setSubjects(subjs);
        if (subjs.length > 0 && !subjectId) {
          setSubjectId(subjs[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load library:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (!title) {
        const nameWithoutExt = droppedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const getFormatBadge = (filename, fileType) => {
    const type = (fileType || "").toLowerCase();
    if (type === "youtube") return { label: "YT VIDEO", bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" };
    if (type === "pdf" || filename?.toLowerCase().endsWith(".pdf")) return { label: "PDF", bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
    if (type === "docx" || type === "doc" || filename?.toLowerCase().endsWith(".docx") || filename?.toLowerCase().endsWith(".doc")) return { label: "DOCX", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    if (type === "txt" || type === "md" || filename?.toLowerCase().endsWith(".txt") || filename?.toLowerCase().endsWith(".md")) return { label: type ? type.toUpperCase() : "TXT", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
    return { label: type ? type.toUpperCase() : "DOC", bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Please choose or drag a document file (.pdf, .docx, .txt) first.");
      return;
    }
    if (!subjectId) {
      setUploadError("Please select a subject. If you don't have subjects, create one on the Dashboard.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadProgress(20);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? prev : prev + 15));
    }, 200);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("subjectId", subjectId);

    try {
      const res = await uploadDocument(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setShowUploadModal(false);
        setFile(null);
        setTitle("");
        setUploadProgress(0);
        setUploading(false);
        fetchLibraryData();
      }, 400);
    } catch (err) {
      clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
      setUploadError(err.response?.data?.error || "Failed to upload document.");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter((doc) => doc._id !== id));
      } catch (err) {
        console.error("Failed to delete document:", err);
      }
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1500px] mx-auto font-sans transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Document Library</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>All your PDF notes, textbooks, and interactive study modules in one workspace.</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleOpenYouTubeModal}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 hover:shadow-red-600/35 transition-all cursor-pointer"
          >
            <Youtube className="w-4 h-4" /> Import YouTube Video
          </button>

          <button
            onClick={handleOpenUploadModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* Executive Single Unified Toolbar (Category Tabs + Search + Subject Filter + View Switcher) */}
      <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Side: Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0 shrink-0">
          <button
            onClick={() => setLibraryCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              libraryCategory === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>All Items</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${libraryCategory === "all" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => setLibraryCategory("documents")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              libraryCategory === "documents"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 Document Notes</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${libraryCategory === "documents" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
              {documents.filter((d) => d.fileType !== "youtube").length}
            </span>
          </button>

          <button
            onClick={() => setLibraryCategory("videos")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              libraryCategory === "videos"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>🎬 Video Notes</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${libraryCategory === "videos" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
              {documents.filter((d) => d.fileType === "youtube").length}
            </span>
          </button>
        </div>

        {/* Right Side: Search Input, Subject Filter & View Mode */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1 lg:flex-initial justify-end">
          {/* Search Bar */}
          <div className="relative w-full sm:w-60 md:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Subject Filter Select */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-1.5 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-40 transition-colors"
            >
              <option value="">All Subjects</option>
              {subjects.map((subj) => (
                <option key={subj._id} value={subj._id}>
                  {subj.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Grid/List Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "grid" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "list" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Grid / List */}
      {loading ? (
        <DocumentScannerLoader message="Loading Study Library Materials..." fullScreen={false} />
      ) : documents.filter((d) => {
          if (libraryCategory === "documents") return d.fileType !== "youtube";
          if (libraryCategory === "videos") return d.fileType === "youtube";
          return true;
        }).length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900/80 p-10 sm:p-14 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 max-w-md mx-auto my-8 shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            {libraryCategory === "videos" ? <Youtube className="w-8 h-8 text-red-500" /> : <FileText className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
            {libraryCategory === "videos" ? "No Video Notes Yet" : "No Document Notes Found"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {libraryCategory === "videos" 
              ? "Import your first YouTube course link to generate AI video notes & chapters."
              : search || selectedSubject ? "No documents match your criteria." : "Upload PDF or DOCX files to start interactive reading."}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {libraryCategory === "videos" ? (
              <button
                onClick={handleOpenYouTubeModal}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <Youtube className="w-4 h-4" /> Import YouTube Video
              </button>
            ) : (
              <button
                onClick={handleOpenUploadModal}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Upload New Document
              </button>
            )}
          </div>
        </motion.div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.filter((d) => {
            if (libraryCategory === "documents") return d.fileType !== "youtube";
            if (libraryCategory === "videos") return d.fileType === "youtube";
            return true;
          }).map((doc) => {
            const completion = Math.round(doc.progress?.completionPercentage || 0);
            const formatBadge = getFormatBadge(doc.fileName || doc.title || doc.fileType, doc.fileType);
            const subjectColor = doc.subjectId?.color || "#6366F1";

            return (
              <motion.div
                key={doc._id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/document/${doc._id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* YouTube Video Thumbnail Banner or Document 16:9 Cover Banner */}
                {doc.fileType === "youtube" ? (
                  <div className="relative w-full h-44 bg-slate-950 overflow-hidden group-hover:brightness-110 transition-all">
                    <img
                      src={doc.youtubeThumbnail || `https://img.youtube.com/vi/${doc.youtubeVideoId}/hqdefault.jpg`}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/30 to-transparent flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20 flex items-center gap-1">
                      <Youtube className="w-3 h-3 text-red-500" /> Video Notes
                    </span>
                  </div>
                ) : (
                  <div 
                    className="relative w-full h-44 overflow-hidden p-4 flex flex-col justify-between group-hover:brightness-105 transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${subjectColor}40 0%, rgba(15, 23, 42, 0.95) 100%)`
                    }}
                  >
                    {/* Top Subject Color Stripe */}
                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: subjectColor }} />

                    {/* Top Row Badges inside Cover */}
                    <div className="flex items-center justify-between relative z-10">
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 backdrop-blur-md text-white"
                        style={{
                          backgroundColor: `${subjectColor}35`,
                          borderColor: `${subjectColor}60`
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subjectColor }} />
                        {doc.subjectId?.name || "General"}
                      </span>

                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border backdrop-blur-md ${formatBadge.bg}`}>
                        .{formatBadge.label}
                      </span>
                    </div>

                    {/* Center 3D Icon Artwork */}
                    <div className="flex items-center justify-center my-auto relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7 text-indigo-300 drop-shadow" />
                      </div>
                    </div>

                    {/* Bottom Cover Tags */}
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/90 relative z-10">
                      <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                        <BookOpen className="w-3 h-3 text-indigo-400" /> Study Module
                      </span>
                      <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded backdrop-blur-md border border-white/10 text-amber-300">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Reflow Ready
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                      {doc.title}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Reading Progress</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">{completion}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-white/5 p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${completion}%`,
                            backgroundColor: subjectColor 
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read Document <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <button
                        onClick={(e) => handleDelete(doc._id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden shadow-sm">
          {documents.map((doc) => {
            const completion = Math.round(doc.progress?.completionPercentage || 0);
            const formatBadge = getFormatBadge(doc.fileName || doc.title || doc.fileType);
            const subjectColor = doc.subjectId?.color || "#6366F1";

            return (
              <div
                key={doc._id}
                onClick={() => navigate(`/document/${doc._id}`)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ 
                      backgroundColor: `${subjectColor}15`, 
                      borderColor: `${subjectColor}30`,
                      color: subjectColor
                    }}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold" style={{ color: subjectColor }}>
                        {doc.subjectId?.name || "General"}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${formatBadge.bg}`}>
                        .{formatBadge.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {doc.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-between sm:justify-end">
                  <div className="w-28 sm:w-36 text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{completion}% Read</span>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full mt-1 border border-slate-200 dark:border-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${completion}%`, backgroundColor: subjectColor }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(doc._id, e)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Upload Modal */}
      {showUploadModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <CloudUpload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Study Document</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">PDF, DOCX, or TXT notes</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20"
                      : file
                      ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10"
                      : "border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-950/60 hover:border-indigo-400"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.txt,.docx,.md"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />

                  {file ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs mx-auto">
                        {file.name}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getFormatBadge(file.name).bg}`}>
                          .{getFormatBadge(file.name).label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                        <CloudUpload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Drag and drop your document here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                      </p>
                      <div className="flex justify-center gap-2 pt-1">
                        {['.PDF', '.DOCX', '.TXT'].map((ext) => (
                          <span key={ext} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                            {ext}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subject Selector Pills */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select Subject
                  </label>
                  {subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                      {subjects.map((s) => {
                        const isSelected = subjectId === s._id;
                        const color = s.color || '#6366F1';
                        return (
                          <button
                            key={s._id}
                            type="button"
                            onClick={() => setSubjectId(s._id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                                : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
                            }`}
                          >
                            <span 
                              className="w-2.5 h-2.5 rounded-full" 
                              style={{ backgroundColor: isSelected ? '#FFFFFF' : color }} 
                            />
                            {s.name}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-500">No subjects found. Please create a subject first from the Dashboard.</p>
                  )}
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Operating Systems Lecture 4"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Animated Upload Progress */}
                {uploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      <span>Parsing & Parsing Text Content...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    {uploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" /> Upload Document
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Modal Dialog for Import YouTube Video */}
        {showYouTubeModal &&
          createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div 
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center">
                      <Youtube className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Import YouTube Study Video</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Generate AI notes & chapters from YouTube link</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowYouTubeModal(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {ytError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{ytError}</span>
                  </div>
                )}

                <form onSubmit={handleYouTubeSubmit} className="space-y-5">
                  {/* YouTube URL Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      YouTube Video URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Youtube className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        required
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Subject Selector Pills */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Select Subject <span className="text-rose-500">*</span>
                    </label>
                    {subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                        {subjects.map((s) => {
                          const isSelected = subjectId === s._id;
                          const color = s.color || '#6366F1';
                          return (
                            <button
                              key={s._id}
                              type="button"
                              onClick={() => setSubjectId(s._id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                                isSelected
                                  ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20"
                                  : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
                              }`}
                            >
                              <span 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: isSelected ? '#FFFFFF' : color }} 
                              />
                              {s.name}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-500">No subjects found. Please create a subject first from the Dashboard.</p>
                    )}
                  </div>

                  {/* Custom Title Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Lesson Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., React Hooks Complete Tutorial"
                      value={ytCustomTitle}
                      onChange={(e) => setYtCustomTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowYouTubeModal(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={ytImporting}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-600/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      {ytImporting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating AI Notes...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" /> Import & Generate AI Notes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}
    </div>
  );
};

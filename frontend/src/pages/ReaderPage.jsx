import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentById, updateReadingProgress } from "../services/documentService";
import { SERVER_BASE_URL } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import {
  getBookmarks, createBookmark, deleteBookmark,
  getHighlights, createHighlight, updateHighlight, deleteHighlight,
  getNotes, createNote, deleteNote
} from "../services/annotationService";
import { StudyReader } from "../components/reader/StudyReader";
import {
  BookOpen, Layers, Bookmark, Highlighter, MessageSquare, ChevronLeft, ChevronRight,
  ArrowLeft, Plus, Trash2, CheckCircle, Sparkles, Sun, Moon, Edit3, X, Youtube, Play, Video
} from "lucide-react";

const extractYouTubeVideoId = (url) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

export const ReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("study"); // "study" or "original"

  // Active Tab for Sidebar: "toc", "highlights", "bookmarks", "notes"
  const [activeTab, setActiveTab] = useState("toc");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Reader State
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPageVal, setInputPageVal] = useState(1);
  const [fontSize, setFontSize] = useState(16);

  // Annotation Data
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);

  // Annotation Input State
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState("yellow");
  const [selectedText, setSelectedText] = useState("");
  const [highlightNoteText, setHighlightNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [popoverPos, setPopoverPos] = useState(null); // Dynamic floating popover coordinates

  // Edit Existing Highlight Modal State
  const [editingHighlight, setEditingHighlight] = useState(null);

  const mainCanvasRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    loadDocumentDetails();
  }, [id]);

  useEffect(() => {
    setInputPageVal(currentPage);
  }, [currentPage]);

  const loadDocumentDetails = async () => {
    try {
      const res = await getDocumentById(id);
      if (res.success) {
        setDocument(res.data);
        if (res.data.progress) {
          const initialPage = res.data.progress.currentPage || 1;
          setCurrentPage(initialPage);
          setInputPageVal(initialPage);
        }
      }

      // Load Annotations
      const [bRes, hRes, nRes] = await Promise.all([
        getBookmarks(id),
        getHighlights(id),
        getNotes(id)
      ]);

      if (bRes.success) setBookmarks(bRes.data);
      if (hRes.success) setHighlights(hRes.data);
      if (nRes.success) setNotes(nRes.data);
    } catch (err) {
      console.error("Failed to load document:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2-Way Page Navigation and Smooth Scroll
  const handlePageOrScrollChange = (newPage) => {
    if (!document) return;
    const totalPages = Math.max(1, document.totalPages || 1);
    const targetPage = Math.min(Math.max(1, newPage), totalPages);

    setCurrentPage(targetPage);
    setInputPageVal(targetPage);

    // Smooth Scroll Canvas in Study Reflow Mode
    if (mainCanvasRef.current && mode === "study") {
      const scrollParent = mainCanvasRef.current;
      const scrollableHeight = scrollParent.scrollHeight - scrollParent.clientHeight;
      if (scrollableHeight > 0) {
        const targetRatio = (targetPage - 1) / Math.max(1, totalPages - 1);
        const targetY = targetRatio * scrollableHeight;

        scrollParent.scrollTo({
          top: targetY,
          behavior: "smooth"
        });
      }
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateReadingProgress(id, {
          currentPage: targetPage,
          timeSpentIncrementSeconds: 10
        });
      } catch (err) {
        console.error("Failed to auto-save progress:", err);
      }
    }, 2000);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(inputPageVal, 10);
    if (!isNaN(parsed) && document) {
      handlePageOrScrollChange(parsed);
    } else {
      setInputPageVal(currentPage);
    }
  };

  // Real-time Page Number detection on manual scroll
  const handleCanvasScroll = (e) => {
    if (!document || !document.totalPages || document.totalPages <= 1) return;
    const target = e.currentTarget;
    const scrollableHeight = target.scrollHeight - target.clientHeight;
    if (scrollableHeight <= 0) return;

    const ratio = target.scrollTop / scrollableHeight;
    const calcPage = Math.min(
      document.totalPages,
      Math.max(1, Math.round(ratio * (document.totalPages - 1)) + 1)
    );

    if (calcPage !== currentPage) {
      setCurrentPage(calcPage);
      setInputPageVal(calcPage);
    }
  };

  // Handle Bookmark Creation
  const handleAddBookmark = async () => {
    try {
      const res = await createBookmark({
        documentId: id,
        pageNumber: currentPage,
        title: `Bookmark Page ${currentPage}`
      });
      if (res.success) {
        setBookmarks([...bookmarks, res.data]);
      }
    } catch (err) {
      console.error("Failed to add bookmark:", err);
    }
  };

  // Handle Note Creation
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    try {
      const res = await createNote({
        documentId: id,
        pageNumber: currentPage,
        title: newNoteTitle || `Note Page ${currentPage}`,
        content: newNoteContent
      });
      if (res.success) {
        setNotes([res.data, ...notes]);
        setNewNoteContent("");
        setNewNoteTitle("");
      }
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  };

  // Dynamic Floating Popover position text selection handler
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (text.length >= 2) {
      setSelectedText(text);

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const canvas = mainCanvasRef.current;

        if (canvas && rect.width > 0 && rect.height > 0) {
          const canvasRect = canvas.getBoundingClientRect();

          let popTop = rect.top - canvasRect.top + canvas.scrollTop - 95;
          if (popTop < canvas.scrollTop + 10) {
            popTop = rect.bottom - canvasRect.top + canvas.scrollTop + 10;
          }

          const selectionCenterX = rect.left + rect.width / 2;
          let popLeft = selectionCenterX - canvasRect.left;

          setPopoverPos({
            top: popTop,
            left: Math.max(160, Math.min(popLeft, canvasRect.width - 160))
          });
        } else {
          setPopoverPos(null);
        }
      } catch (e) {
        setPopoverPos(null);
      }
    }
  };

  // Click handler on canvas to detect clicks on existing <mark> highlights
  const handleCanvasClick = (e) => {
    const markTag = e.target.closest("mark[data-highlight-id]");
    if (markTag) {
      const hId = markTag.getAttribute("data-highlight-id");
      const found = highlights.find((h) => h._id === hId);
      if (found) {
        setEditingHighlight(found);
      }
    }
  };

  // Create new highlight
  const handleAddHighlight = async () => {
    if (!selectedText) return;
    try {
      const res = await createHighlight({
        documentId: id,
        pageNumber: currentPage,
        selectedText,
        color: selectedHighlightColor,
        noteText: highlightNoteText
      });
      if (res.success) {
        setHighlights([res.data, ...highlights]);

        if (highlightNoteText.trim()) {
          const nRes = await createNote({
            documentId: id,
            pageNumber: currentPage,
            title: `Comment: "${selectedText.slice(0, 20)}..."`,
            content: highlightNoteText
          });
          if (nRes.success) {
            setNotes((prev) => [nRes.data, ...prev]);
          }
        }

        setSelectedText("");
        setHighlightNoteText("");
        setShowNoteInput(false);
        setPopoverPos(null);
      }
    } catch (err) {
      console.error("Failed to add highlight:", err);
    }
  };

  // Update existing highlight color
  const handleUpdateHighlightColor = async (newColor) => {
    if (!editingHighlight) return;
    try {
      const res = await updateHighlight(editingHighlight._id, {
        color: newColor,
        noteText: editingHighlight.noteText || ""
      });
      if (res.success) {
        setHighlights((prev) =>
          prev.map((h) => (h._id === editingHighlight._id ? res.data : h))
        );
        setEditingHighlight(res.data);
      }
    } catch (err) {
      console.error("Failed to update highlight color:", err);
    }
  };

  // Scroll directly to highlighted text element in document canvas
  const jumpToHighlight = (highlightId) => {
    if (!mainCanvasRef.current) return;
    const markEl = mainCanvasRef.current.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (markEl) {
      markEl.scrollIntoView({ behavior: "smooth", block: "center" });
      markEl.classList.add("ring-2", "ring-indigo-500");
      setTimeout(() => markEl.classList.remove("ring-2", "ring-indigo-500"), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080C14] text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs">
        Loading StudyFlow Workspace Reader...
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080C14] text-slate-600 dark:text-slate-400 flex flex-col items-center justify-center p-4">
        <p>Document not found.</p>
        <button
          onClick={() => navigate("/library")}
          className="mt-4 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:underline"
        >
          ← Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-57px)] bg-slate-100 dark:bg-[#080C14] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden font-sans transition-colors duration-200">
      {/* Reader Header Toolbar */}
      <div className="glass-panel border-b border-slate-200 dark:border-white/5 px-4 py-2.5 flex items-center justify-between z-20 shrink-0">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/library")}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="Back to Library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="Toggle Sidebar"
          >
            <Layers className="w-4 h-4" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white max-w-[110px] sm:max-w-xs truncate">{document.title}</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Page {currentPage} of {document.totalPages}
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode("study")}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === "study"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="Study Reflow Mode"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Study Mode</span>
          </button>
          <button
            onClick={() => setMode("original")}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === "original"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="Original PDF Mode"
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">PDF Mode</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {mode === "study" && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-2 py-1">
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs px-1 font-bold"
                title="Decrease Font Size"
              >
                A-
              </button>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono px-1">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs px-1 font-bold"
                title="Increase Font Size"
              >
                A+
              </button>
            </div>
          )}

          <button
            onClick={handleAddBookmark}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all text-xs font-medium flex items-center gap-1"
            title="Bookmark Current Page"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Bookmark</span>
          </button>

          {/* Direct Page Jump Control (< 4/52 >) */}
          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-0.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageOrScrollChange(currentPage - 1)}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center text-xs font-mono px-1">
              <input
                type="number"
                min={1}
                max={document.totalPages || 1}
                value={inputPageVal}
                onChange={(e) => setInputPageVal(e.target.value)}
                onBlur={handlePageInputSubmit}
                className="w-8 sm:w-10 bg-transparent text-center font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:bg-slate-200 dark:focus:bg-slate-900 rounded py-0.5"
                title="Type page number and press Enter"
              />
              <span className="text-slate-500 dark:text-slate-400">/{document.totalPages || 1}</span>
            </div>
            <button
              type="button"
              disabled={currentPage >= (document.totalPages || 1)}
              onClick={() => handlePageOrScrollChange(currentPage + 1)}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden"
          />
        )}

        {/* Sidebar Drawer */}
        <div className={`absolute md:relative inset-y-0 left-0 w-[85vw] max-w-[320px] md:w-80 glass-panel border-r border-slate-200 dark:border-white/10 flex flex-col z-30 transition-all duration-300 ${sidebarOpen ? "ml-0 shadow-2xl" : "-ml-[85vw] md:-ml-80"}`}>
          {/* Segmented Tab Switcher Header */}
          <div className="p-2 border-b border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-slate-950/80">
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-900/90 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab("toc")}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === "toc"
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Table of Contents"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Contents</span>
              </button>

              <button
                onClick={() => setActiveTab("highlights")}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === "highlights"
                    ? "bg-white dark:bg-amber-600 text-amber-600 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Saved Highlights"
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>({highlights.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === "bookmarks"
                    ? "bg-white dark:bg-emerald-600 text-emerald-600 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Bookmarks"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>({bookmarks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === "notes"
                    ? "bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Personal Notes"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>({notes.length})</span>
              </button>
            </div>
          </div>

          {/* Sidebar Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === "toc" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" /> Table of Contents
                  </h4>
                </div>
                {document.toc && document.toc.length > 0 ? (
                  document.toc.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageOrScrollChange(item.pageNumber)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                        currentPage === item.pageNumber
                          ? "bg-indigo-600 text-white font-bold shadow-sm"
                          : "bg-slate-100/60 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 hover:border-indigo-400"
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${currentPage === item.pageNumber ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>P.{item.pageNumber}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 space-y-2 bg-slate-50/50 dark:bg-slate-900/30">
                    <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Chapters Detected</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Use direct page navigation to jump across pages.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "highlights" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/5">
                  <h4 className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Highlighter className="w-3.5 h-3.5" /> Saved Highlights ({highlights.length})
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Click to jump</span>
                </div>
                {highlights.length > 0 ? (
                  highlights.map((h) => (
                    <div
                      key={h._id}
                      onClick={() => {
                        jumpToHighlight(h._id);
                        setEditingHighlight(h);
                      }}
                      className="glass-card p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 cursor-pointer space-y-2 hover:border-amber-500/50 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              h.color === "yellow" ? "bg-amber-400 shadow-sm shadow-amber-400/50" : h.color === "green" ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : h.color === "blue" ? "bg-sky-400 shadow-sm shadow-sky-400/50" : "bg-pink-400 shadow-sm shadow-pink-400/50"
                            }`}
                          />
                          <span className="text-[10px] font-extrabold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                            Page {h.pageNumber}
                          </span>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await deleteHighlight(h._id);
                            setHighlights(highlights.filter((item) => item._id !== h._id));
                            if (editingHighlight && editingHighlight._id === h._id) setEditingHighlight(null);
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                          title="Delete Highlight"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-800 dark:text-slate-200 font-serif italic line-clamp-3 border-l-2 border-amber-500 pl-2.5 py-0.5">
                        "{h.selectedText}"
                      </p>

                      {h.noteText && (
                        <div className="text-[11px] text-purple-700 dark:text-purple-300 bg-purple-500/10 border border-purple-500/20 p-2 rounded-xl flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="truncate font-medium">{h.noteText}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                      <Highlighter className="w-5 h-5" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">No Highlights Yet</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Select any text inside the document to highlight in yellow, green, blue or pink with inline comments.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "bookmarks" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/5">
                  <h4 className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" /> Bookmarks ({bookmarks.length})
                  </h4>
                  <button
                    onClick={handleAddBookmark}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Page {currentPage}
                  </button>
                </div>

                {bookmarks.length > 0 ? (
                  bookmarks.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => handlePageOrScrollChange(b.pageNumber)}
                      className="glass-card p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 cursor-pointer flex items-center justify-between hover:border-emerald-500/50 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Bookmark className="w-4 h-4 fill-current" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{b.title}</h5>
                          <span className="text-[10px] font-extrabold font-mono text-slate-500 dark:text-slate-400">Page {b.pageNumber}</span>
                        </div>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await deleteBookmark(b._id);
                          setBookmarks(bookmarks.filter((item) => item._id !== b._id));
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Delete Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                      <Bookmark className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">No Bookmarks Saved</h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                        Save key pages so you can jump back to your important study sections instantly.
                      </p>
                    </div>
                    <button
                      onClick={handleAddBookmark}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Bookmark Page {currentPage}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2.5 glass-card p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> Add Note
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">Page {currentPage}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-1.5 px-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <textarea
                    rows={3}
                    required
                    placeholder="Write personal note for current page..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    Save Note for Page {currentPage}
                  </button>
                </form>

                <div className="space-y-2.5">
                  {notes.length > 0 ? (
                    notes.map((n) => (
                      <div key={n._id} className="glass-card p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-1.5 shadow-sm hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-300">{n.title}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">P.{n.pageNumber}</span>
                            <button
                              onClick={async () => {
                                await deleteNote(n._id);
                                setNotes(notes.filter((item) => item._id !== n._id));
                              }}
                              className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Personal Notes Yet</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Use the form above to record key concepts for revision.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Reading Canvas Container */}
        <div
          ref={mainCanvasRef}
          onScroll={handleCanvasScroll}
          onMouseUp={handleTextSelection}
          onClick={handleCanvasClick}
          className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/40 dark:bg-[#080C14] flex justify-center relative transition-colors duration-200"
        >
          <div className="w-full max-w-4xl space-y-6">
            {/* Dynamic Floating Selection Popover Toolbar */}
            {selectedText && (
              <div
                style={
                  popoverPos
                    ? {
                        position: "absolute",
                        top: `${popoverPos.top}px`,
                        left: `${popoverPos.left}px`,
                        transform: "translateX(-50%)",
                        width: "90%",
                        maxWidth: "500px"
                      }
                    : {}
                }
                className={`${
                  popoverPos ? "z-50 border-indigo-500/50" : "sticky top-4 z-40 max-w-xl mx-auto border-indigo-500/40"
                } glass-panel p-3.5 rounded-2xl border shadow-xl space-y-3 bg-slate-900/95 backdrop-blur-md relative`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Highlighter className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-mono text-slate-300 truncate max-w-xs sm:max-w-md italic">
                      "{selectedText}"
                    </span>
                  </div>
                  <button
                    onClick={() => { setSelectedText(""); setShowNoteInput(false); setHighlightNoteText(""); setPopoverPos(null); }}
                    className="text-slate-500 hover:text-slate-300 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-800"
                    title="Cancel Selection"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                  {/* Color Selectors */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Color:</span>
                    {[
                      { id: "yellow", name: "Yellow", bg: "bg-amber-400", ring: "ring-amber-400" },
                      { id: "green", name: "Green", bg: "bg-emerald-400", ring: "ring-emerald-400" },
                      { id: "blue", name: "Blue", bg: "bg-sky-400", ring: "ring-sky-400" },
                      { id: "pink", name: "Pink", bg: "bg-pink-400", ring: "ring-pink-400" }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedHighlightColor(c.id)}
                        className={`w-6 h-6 rounded-full border border-white/20 transition-all flex items-center justify-center ${c.bg} ${
                          selectedHighlightColor === c.id ? `ring-2 ring-offset-2 ring-offset-slate-900 ${c.ring} scale-110 shadow-sm` : "opacity-70 hover:opacity-100"
                        }`}
                        title={`Highlight in ${c.name}`}
                      >
                        {selectedHighlightColor === c.id && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                      </button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNoteInput(!showNoteInput)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
                        showNoteInput || highlightNoteText
                          ? "bg-purple-600/30 border-purple-500 text-purple-300"
                          : "bg-slate-900 border-white/10 text-slate-300 hover:text-white"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{showNoteInput ? "Close Note" : "+ Add Comment"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Highlight & Save</span>
                    </button>
                  </div>
                </div>

                {showNoteInput && (
                  <div className="pt-2 animate-fade-in">
                    <input
                      type="text"
                      placeholder="Add a comment or personal note to this highlight..."
                      value={highlightNoteText}
                      onChange={(e) => setHighlightNoteText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddHighlight();
                      }}
                      className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            )}

            {/* Modal to Edit Existing Highlight */}
            {editingHighlight && (
              <div className="sticky top-4 z-40 glass-panel p-4 rounded-2xl border border-amber-500/50 shadow-xl space-y-3 max-w-xl mx-auto bg-slate-900/95 backdrop-blur-md">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white">Edit Highlight Color</h4>
                  </div>
                  <button
                    onClick={() => setEditingHighlight(null)}
                    className="p-1 text-slate-400 hover:text-white rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 italic font-serif border-l-2 border-amber-400/60 pl-2">
                  "{editingHighlight.selectedText}"
                </p>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Change Color:</span>
                    {[
                      { id: "yellow", bg: "bg-amber-400", ring: "ring-amber-400" },
                      { id: "green", bg: "bg-emerald-400", ring: "ring-emerald-400" },
                      { id: "blue", bg: "bg-sky-400", ring: "ring-sky-400" },
                      { id: "pink", bg: "bg-pink-400", ring: "ring-pink-400" }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleUpdateHighlightColor(c.id)}
                        className={`w-6 h-6 rounded-full border border-white/20 transition-all flex items-center justify-center ${c.bg} ${
                          editingHighlight.color === c.id ? `ring-2 ring-offset-2 ring-offset-slate-900 ${c.ring} scale-110` : "opacity-60 hover:opacity-100"
                        }`}
                        title={`Change to ${c.id}`}
                      >
                        {editingHighlight.color === c.id && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={async () => {
                      await deleteHighlight(editingHighlight._id);
                      setHighlights(highlights.filter((h) => h._id !== editingHighlight._id));
                      setEditingHighlight(null);
                    }}
                    className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* Reading View Modes */}
            {mode === "study" ? (
              /* Study Mode Reflow View */
              <div
                className="bg-white dark:bg-[#111827] p-6 sm:p-12 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg leading-relaxed text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 font-sans transition-colors"
                style={{ fontSize: `${fontSize}px` }}
              >
                <div className="border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">
                    {document.fileType === "youtube" ? "🎬 YouTube AI Study Workspace" : `Study Reflow Mode • Page ${currentPage} of ${document.totalPages}`}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{document.title}</h1>
                </div>

                {/* Interactive YouTube Video Player Embed */}
                {document.fileType === "youtube" && (
                  <div className="bg-slate-950 p-3 sm:p-4 rounded-3xl border border-red-500/30 shadow-2xl mb-8 overflow-hidden">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                      <span className="text-xs font-bold text-red-400 flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500" /> Interactive YouTube Study Player
                      </span>
                      {document.youtubeUrl && (
                        <a
                          href={document.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                        >
                          <span>Watch on YouTube</span> ↗
                        </a>
                      )}
                    </div>
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-inner bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${document.youtubeVideoId || extractYouTubeVideoId(document.youtubeUrl)}?autoplay=0&rel=0`}
                        title={document.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                <StudyReader htmlContent={document.extractedText} highlights={highlights} />
              </div>
            ) : (
              /* Original PDF Mode View */
              <div className="bg-white dark:bg-[#111827] p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg min-h-[75vh] flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    📄 Original File View ({document.fileType ? document.fileType.toUpperCase() : "DOC"}) • Page {currentPage}
                  </span>
                  {document.fileUrl && (
                    <a
                      href={`${SERVER_BASE_URL}${document.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-semibold flex items-center gap-1 border border-indigo-500/30"
                    >
                      <span>Open Original File</span> ↗
                    </a>
                  )}
                </div>

                {document.fileType === "pdf" ? (
                  <iframe
                    key={`pdf-${currentPage}`}
                    src={`${SERVER_BASE_URL}${document.fileUrl}#page=${currentPage}`}
                    className="w-full flex-1 min-h-[600px] rounded-2xl border-none bg-slate-900"
                    title={document.title}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4 min-h-[400px]">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">
                        {document.fileType ? document.fileType.toUpperCase() : "Document"} File View
                      </h3>
                      <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                        For {document.fileType ? document.fileType.toUpperCase() : "Word/Text"} files, switch to <span className="text-indigo-400 font-semibold">Study Reflow Mode</span> above for full interactive code learning & Notion-style workspace reading!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

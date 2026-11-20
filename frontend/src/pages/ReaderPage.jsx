import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentById, updateReadingProgress } from "../services/documentService";
import { SERVER_BASE_URL } from "../services/api";
import {
  getBookmarks,
  createBookmark,
  deleteBookmark,
  getHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  getNotes,
  createNote,
  deleteNote
} from "../services/annotationService";
import { createInterviewFromDocument } from "../services/interviewService";
import { StudyReader } from "../components/reader/StudyReader";
import {
  BookOpen,
  Layers,
  Bookmark,
  Highlighter,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Edit3,
  X,
  Mic,
  FileText
} from "lucide-react";
import {
  Button,
  Badge,
  Card,
  Kbd,
  SegmentedTabs,
  Modal,
  Drawer,
  ProgressBar
} from "../components/ui";
import { DocumentScannerLoader } from "../components/common/DocumentScannerLoader";

export const ReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [popoverPos, setPopoverPos] = useState(null);

  // Edit Existing Highlight Modal State
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [startingInterview, setStartingInterview] = useState(false);

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
      setLoading(true);
      const res = await getDocumentById(id);
      if (res.success) {
        setDocument(res.data);
        if (res.data.progress) {
          const initialPage = res.data.progress.currentPage || 1;
          setCurrentPage(initialPage);
          setInputPageVal(initialPage);
        }
      }

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

  // Dynamically compute rich Table of Contents from doc.toc, doc.aiChapters, or extracted headings
  const tableOfContents = useMemo(() => {
    if (!document) return [];

    if (Array.isArray(document.toc) && document.toc.length > 0) {
      return document.toc;
    }

    if (Array.isArray(document.aiChapters) && document.aiChapters.length > 0) {
      return document.aiChapters.map((chap, idx) => ({
        id: `chapter-${idx}`,
        level: 1,
        title: chap.title || `Chapter ${idx + 1}`,
        timestamp: chap.timestamp || "00:00",
        pageNumber: Math.max(1, Math.round((idx + 1) * ((document.totalPages || 1) / Math.max(1, document.aiChapters.length))))
      }));
    }

    const rawContent = document.extractedText || document.content || "";
    if (!rawContent) return [];

    const extracted = [];
    const headingRegex = /<h([1-3])[^>]*>(.*?)<\/h\1>/gi;
    let match;
    let index = 0;
    while ((match = headingRegex.exec(rawContent)) !== null && index < 60) {
      const level = parseInt(match[1], 10);
      const cleanTitle = match[2].replace(/<[^>]+>/g, "").trim();
      if (cleanTitle && cleanTitle.length >= 2 && cleanTitle.length < 120) {
        extracted.push({
          id: `heading-${index++}`,
          level,
          title: cleanTitle,
          pageNumber: document.totalPages > 1
            ? Math.min(document.totalPages, Math.max(1, Math.round((match.index / rawContent.length) * document.totalPages) + 1))
            : 1
        });
      }
    }
    return extracted;
  }, [document]);

  const handleTocClick = (item) => {
    if (item.id?.startsWith("heading-")) {
      const headings = mainCanvasRef.current?.querySelectorAll("h1, h2, h3");
      if (headings) {
        for (const h of headings) {
          const text = h.textContent.trim().toLowerCase();
          const target = item.title.trim().toLowerCase();
          if (text === target || text.includes(target) || target.includes(text)) {
            h.scrollIntoView({ behavior: "smooth", block: "start" });
            h.classList.add("ring-2", "ring-indigo-500", "rounded", "transition-all");
            setTimeout(() => h.classList.remove("ring-2", "ring-indigo-500", "rounded"), 2200);
            return;
          }
        }
      }
    }
    handlePageOrScrollChange(item.pageNumber);
  };

  const handleStartDocInterview = async () => {
    if (!document) return;
    try {
      setStartingInterview(true);
      const res = await createInterviewFromDocument({
        documentId: id,
        title: `Interview: ${document.title}`,
        topic: document.subjectId?.name || document.subjectTitle || "General"
      });
      if (res?.success && res.interviewSet?._id) {
        navigate(`/interview/${res.interviewSet._id}`);
      }
    } catch (err) {
      console.error("Failed to start mock interview from document:", err);
      alert("Could not extract interview questions from this document. Try creating a set in the Interview Hub.");
    } finally {
      setStartingInterview(false);
    }
  };

  const handlePageOrScrollChange = (newPage) => {
    if (!document) return;
    const totalPages = Math.max(1, document.totalPages || 1);
    const targetPage = Math.min(Math.max(1, newPage), totalPages);

    setCurrentPage(targetPage);
    setInputPageVal(targetPage);

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

          let popTop = rect.top - canvasRect.top + canvas.scrollTop - 90;
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
      <DocumentScannerLoader message="Loading StudyFlow Workspace Reader..." fullScreen={true} />
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-[#070709] text-zinc-400 flex flex-col items-center justify-center p-4">
        <p>Document not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/library")} className="mt-4">
          ← Back to Library
        </Button>
      </div>
    );
  }

  const sidebarTabs = [
    { id: "toc", label: "TOC", icon: Layers },
    { id: "highlights", label: `Marks (${highlights.length})`, icon: Highlighter },
    { id: "bookmarks", label: `Pins (${bookmarks.length})`, icon: Bookmark },
    { id: "notes", label: `Notes (${notes.length})`, icon: MessageSquare }
  ];

  return (
    <div className="h-[calc(100vh-53px)] bg-[#070709] bg-luxury-mesh text-zinc-100 flex flex-col overflow-hidden font-sans antialiased">
      {/* Precision Floating Reader Header */}
      <header className="bg-[#12131a] border-b border-white/[0.08] px-4 py-2 flex items-center justify-between z-20 shrink-0 gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Left: Back & Document Metadata */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/library")}
            title="Back to Library"
            className="h-8 w-8 p-0"
          />

          <Button
            variant={sidebarOpen ? "secondary" : "ghost"}
            size="sm"
            icon={Layers}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
            className="h-8 w-8 p-0"
          />

          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate max-w-full sm:max-w-md">
              {document.title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span>{document.subjectId?.name || document.subjectTitle || "General"}</span>
              <span>•</span>
              <span>Page {currentPage} of {document.totalPages || 1}</span>
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="hidden sm:flex items-center bg-[#090a0f] border border-white/[0.08] rounded-md p-0.5 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setMode("study")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              mode === "study"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Study Reflow
          </button>
          <button
            type="button"
            onClick={() => setMode("original")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              mode === "original"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Original PDF
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {mode === "study" && (
            <div className="hidden sm:flex items-center gap-1 bg-[#090a0f] border border-white/[0.08] rounded-md px-2 py-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className="text-zinc-400 hover:text-white px-1 font-bold"
              >
                A-
              </button>
              <span className="text-[11px] text-zinc-500 px-1">{fontSize}px</span>
              <button
                type="button"
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className="text-zinc-400 hover:text-white px-1 font-bold"
              >
                A+
              </button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={Bookmark}
            onClick={handleAddBookmark}
            title="Bookmark Current Page"
          >
            <span className="hidden lg:inline">Bookmark</span>
          </Button>

          <Button
            variant="indigo"
            size="sm"
            icon={Mic}
            loading={startingInterview}
            onClick={handleStartDocInterview}
            title="Generate Interview Drill"
          >
            <span className="hidden sm:inline">Mock Drill</span>
          </Button>

          {/* Page Jump */}
          <form onSubmit={handlePageInputSubmit} className="hidden sm:flex items-center gap-0.5 bg-[#090a0f] border border-white/[0.08] rounded-md p-0.5 font-mono text-xs">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageOrScrollChange(currentPage - 1)}
              className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft size={13} />
            </button>
            <input
              type="number"
              min={1}
              max={document.totalPages || 1}
              value={inputPageVal}
              onChange={(e) => setInputPageVal(e.target.value)}
              onBlur={handlePageInputSubmit}
              className="w-8 bg-transparent text-center font-bold text-zinc-200 focus:outline-none"
            />
            <span className="text-zinc-500 pr-1">/{document.totalPages || 1}</span>
            <button
              type="button"
              disabled={currentPage >= (document.totalPages || 1)}
              onClick={() => handlePageOrScrollChange(currentPage + 1)}
              className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight size={13} />
            </button>
          </form>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Drawer */}
        <div
          className={`absolute md:relative inset-y-0 left-0 w-[85vw] max-w-[320px] md:w-80 bg-[#0c0d14] border-r border-white/[0.08] flex flex-col z-30 transition-all duration-300 ${
            sidebarOpen ? "ml-0 shadow-2xl" : "-ml-[85vw] md:-ml-80"
          }`}
        >
          <div className="p-2 border-b border-white/[0.06] bg-[#090a0f]">
            <SegmentedTabs
              tabs={sidebarTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {activeTab === "toc" && (
              <div className="space-y-1">
                {tableOfContents && tableOfContents.length > 0 ? (
                  tableOfContents.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => handleTocClick(item)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                        item.level === 1
                          ? "font-semibold text-zinc-100 bg-white/[0.02]"
                          : item.level === 2
                          ? "pl-4 text-zinc-300"
                          : "pl-6 text-zinc-400"
                      } hover:text-white hover:bg-white/[0.06]`}
                    >
                      <span className="truncate pr-2">{item.title}</span>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                        {item.timestamp ? item.timestamp : `P.${item.pageNumber}`}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-zinc-500">
                    No Table of Contents detected. Use page jump above.
                  </div>
                )}
              </div>
            )}

            {activeTab === "highlights" && (
              <div className="space-y-2">
                {highlights.map((h) => (
                  <div
                    key={h._id}
                    onClick={() => {
                      jumpToHighlight(h._id);
                      setEditingHighlight(h);
                    }}
                    className="p-3 rounded-md bg-[#12131a] border border-white/[0.06] hover:border-white/[0.14] cursor-pointer space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-indigo-400 font-semibold">Page {h.pageNumber}</span>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await deleteHighlight(h._id);
                          setHighlights(highlights.filter((item) => item._id !== h._id));
                        }}
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-200 line-clamp-2 italic">
                      "{h.selectedText}"
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "bookmarks" && (
              <div className="space-y-2">
                {bookmarks.map((b) => (
                  <div
                    key={b._id}
                    onClick={() => handlePageOrScrollChange(b.pageNumber)}
                    className="p-2.5 rounded-md bg-[#12131a] border border-white/[0.06] hover:border-white/[0.14] cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="text-zinc-200 font-medium">{b.title || `Page ${b.pageNumber}`}</span>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await deleteBookmark(b._id);
                        setBookmarks(bookmarks.filter((item) => item._id !== b._id));
                      }}
                      className="text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                <form onSubmit={handleAddNote} className="space-y-2 pb-3 border-b border-white/[0.06]">
                  <textarea
                    rows={2}
                    placeholder="Write a personal study note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full p-2.5 rounded-md bg-zinc-950 border border-white/[0.08] text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono"
                  />
                  <Button type="submit" variant="primary" size="sm" className="w-full">
                    Save Note
                  </Button>
                </form>

                <div className="space-y-2">
                  {notes.map((n) => (
                    <div key={n._id} className="p-3 rounded-md bg-[#12131a] border border-white/[0.06] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>Page {n.pageNumber}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteNote(n._id);
                            setNotes(notes.filter((item) => item._id !== n._id));
                          }}
                          className="hover:text-rose-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed font-sans">{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reading Canvas */}
        <div
          ref={mainCanvasRef}
          onScroll={handleCanvasScroll}
          onMouseUp={handleTextSelection}
          onClick={handleCanvasClick}
          className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 relative flex justify-center"
        >
          <div className="w-full max-w-3xl space-y-6" style={{ fontSize: `${fontSize}px` }}>
            {mode === "study" ? (
              <StudyReader
                htmlContent={document.extractedText || document.content || ""}
                highlights={highlights}
              />
            ) : (
              <div className="w-full h-full min-h-[700px] rounded-lg overflow-hidden border border-white/[0.08] bg-[#12131a]">
                <iframe
                  src={
                    document.fileUrl?.startsWith("http")
                      ? document.fileUrl
                      : `${SERVER_BASE_URL}${document.fileUrl?.startsWith("/") ? "" : "/"}${document.fileUrl || document.filePath || ""}`
                  }
                  className="w-full h-[85vh] border-none"
                  title="PDF Viewer"
                />
              </div>
            )}
          </div>

          {/* Floating Selection Popover */}
          {popoverPos && selectedText && (
            <div
              style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
              className="absolute z-50 -translate-x-1/2 p-1.5 rounded-lg bg-[#12131a] border border-white/[0.12] shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-95"
            >
              <div className="flex items-center gap-1 px-1">
                {["yellow", "green", "blue", "pink"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedHighlightColor(color);
                      handleAddHighlight();
                    }}
                    className={`w-5 h-5 rounded-full transition-transform hover:scale-125 ${
                      color === "yellow" ? "bg-amber-400" : color === "green" ? "bg-emerald-400" : color === "blue" ? "bg-sky-400" : "bg-pink-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReaderPage;

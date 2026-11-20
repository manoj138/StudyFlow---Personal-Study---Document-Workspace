import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getDocuments,
  uploadDocument,
  importYouTubeDocument,
  deleteDocument
} from "../services/documentService";
import API from "../services/api";
import {
  Upload,
  BookOpen,
  LayoutGrid,
  List,
  AlertCircle,
  FileText,
  Youtube,
  Trash2,
  ArrowRight,
  Sparkles,
  CloudUpload,
  CheckCircle2
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  PageHeader,
  SegmentedTabs,
  SearchInput,
  Select,
  Modal,
  FormField,
  Input,
  ProgressBar,
  EmptyState
} from "../components/ui";
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
      setYtError("Please select a subject track first.");
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Please choose or drag a document file (.pdf, .docx, .txt, .md) first.");
      return;
    }
    if (!subjectId) {
      setUploadError("Please select a subject track.");
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
      await uploadDocument(formData);
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

  const getFormatBadge = (filename, fileType) => {
    const type = (fileType || "").toLowerCase();
    if (type === "youtube") return { label: "YOUTUBE", variant: "danger" };
    if (type === "pdf" || filename?.toLowerCase().endsWith(".pdf")) return { label: "PDF", variant: "danger" };
    if (type === "docx" || type === "doc" || filename?.toLowerCase().endsWith(".docx") || filename?.toLowerCase().endsWith(".doc")) return { label: "DOCX", variant: "accent" };
    if (type === "md" || filename?.toLowerCase().endsWith(".md")) return { label: "MD", variant: "neutral" };
    if (type === "txt" || filename?.toLowerCase().endsWith(".txt")) return { label: "TXT", variant: "warning" };
    return { label: type ? type.toUpperCase() : "DOC", variant: "neutral" };
  };

  const filteredDocs = documents.filter((d) => {
    if (libraryCategory === "documents") return d.fileType !== "youtube";
    if (libraryCategory === "videos") return d.fileType === "youtube";
    return true;
  });

  const categoryTabs = [
    {
      id: "all",
      label: "All Items",
      count: documents.length
    },
    {
      id: "documents",
      label: "Documents",
      count: documents.filter((d) => d.fileType !== "youtube").length,
      icon: FileText
    },
    {
      id: "videos",
      label: "Video Notes",
      count: documents.filter((d) => d.fileType === "youtube").length,
      icon: Youtube
    }
  ];

  return (
    <div className="min-h-screen bg-[#08090C] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto font-sans">
      {/* Page Command Strip */}
      <PageHeader
        breadcrumb="STUDYFLOW // DOCUMENT WORKSPACE"
        title="Document Library"
        description="Technical PDFs, documentation, and interactive study modules synchronized with your interview prep."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Youtube}
              onClick={handleOpenYouTubeModal}
            >
              Import Video
            </Button>
            <Button
              variant="indigo"
              size="sm"
              icon={Upload}
              onClick={handleOpenUploadModal}
            >
              Upload Document
            </Button>
          </div>
        }
      />

      {/* Unified Search & Filter Command Strip */}
      <div className="bg-[#0E1015] p-2.5 rounded-lg border border-white/[0.08] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <SegmentedTabs
          tabs={categoryTabs}
          activeTab={libraryCategory}
          onChange={setLibraryCategory}
        />

        <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1 lg:flex-initial justify-end">
          <div className="w-full sm:w-64">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search documents by title..."
              shortcut="/"
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((subj) => (
                <option key={subj._id} value={subj._id}>
                  {subj.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="hidden sm:flex items-center bg-zinc-900 p-0.5 rounded-md border border-zinc-800">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              icon={LayoutGrid}
              onClick={() => setViewMode("grid")}
              className="h-7 w-7 p-0"
              title="Grid View"
            />
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              icon={List}
              onClick={() => setViewMode("list")}
              className="h-7 w-7 p-0"
              title="List View"
            />
          </div>
        </div>
      </div>

      {/* Document Grid / List */}
      {loading ? (
        <DocumentScannerLoader message="Loading Study Library Materials..." fullScreen={false} />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={libraryCategory === "videos" ? Youtube : FileText}
          title={libraryCategory === "videos" ? "No video notes found" : "No documents found"}
          description={
            search || selectedSubject
              ? "No study materials match your search filters."
              : "Upload PDF or DOCX files to start interactive reading and active recall."
          }
          actionLabel={libraryCategory === "videos" ? "Import Video" : "Upload Document"}
          actionIcon={libraryCategory === "videos" ? Youtube : Upload}
          actionVariant="indigo"
          onAction={libraryCategory === "videos" ? handleOpenYouTubeModal : handleOpenUploadModal}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => {
            const completion = Math.round(doc.progress?.completionPercentage || 0);
            const formatBadge = getFormatBadge(doc.fileName || doc.title || doc.fileType, doc.fileType);

            return (
              <Card
                key={doc._id}
                interactive
                onClick={() => navigate(`/document/${doc._id}`)}
                className="space-y-3 flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="neutral" size="sm">
                      {doc.subjectId?.name || "General"}
                    </Badge>
                    <Badge variant={formatBadge.variant} size="sm">
                      .{formatBadge.label}
                    </Badge>
                  </div>

                  <h3
                    className="font-semibold text-zinc-100 text-sm line-clamp-2 leading-snug group-hover:text-white"
                    title={doc.title}
                  >
                    {doc.title}
                  </h3>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>Reading Progress</span>
                      <span className="font-semibold text-zinc-300">{completion}%</span>
                    </div>
                    <ProgressBar value={completion} size="xs" variant={completion >= 95 ? "success" : "neutral"} />
                  </div>
                </div>

                <div className="px-4 py-2.5 border-t border-zinc-800/80 bg-zinc-950/40 rounded-b-lg flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                    Read Document <ArrowRight size={12} />
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={(e) => handleDelete(doc._id, e)}
                    title="Delete Document"
                    className="text-zinc-500 hover:text-rose-400 h-7 w-7 p-0"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="divide-y divide-zinc-800/80 overflow-hidden">
          {filteredDocs.map((doc) => {
            const completion = Math.round(doc.progress?.completionPercentage || 0);
            const formatBadge = getFormatBadge(doc.fileName || doc.title || doc.fileType, doc.fileType);

            return (
              <div
                key={doc._id}
                onClick={() => navigate(`/document/${doc._id}`)}
                className="p-3.5 hover:bg-zinc-850/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
                    <FileText size={15} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono text-zinc-400">
                        {doc.subjectId?.name || "General"}
                      </span>
                      <Badge variant={formatBadge.variant} size="sm">
                        .{formatBadge.label}
                      </Badge>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 hover:text-white transition-colors">
                      {doc.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-5 justify-between sm:justify-end">
                  <div className="w-28 sm:w-36 text-right">
                    <span className="text-[11px] font-mono text-zinc-500">{completion}% Read</span>
                    <ProgressBar value={completion} size="xs" variant={completion >= 95 ? "success" : "neutral"} className="mt-1" />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={(e) => handleDelete(doc._id, e)}
                    title="Delete Document"
                    className="text-zinc-500 hover:text-rose-400 h-7 w-7 p-0"
                  />
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Study Document"
        icon={CloudUpload}
        description="PDF, DOCX, TXT, or MD study notes"
      >
        <div className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2 font-mono">
              <AlertCircle size={14} className="shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border border-dashed rounded-md p-6 text-center transition-colors cursor-pointer relative ${
                isDragging
                  ? "border-indigo-500 bg-indigo-500/10"
                  : file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.txt,.docx,.md"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />

              {file ? (
                <div className="space-y-1.5">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto" />
                  <div className="text-xs font-semibold text-zinc-100 truncate max-w-xs mx-auto">
                    {file.name}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <CloudUpload size={24} className="text-zinc-500 mx-auto" />
                  <p className="text-xs text-zinc-300 font-medium">
                    Drag and drop file here, or <span className="text-zinc-100 underline">browse</span>
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Supports PDF, DOCX, TXT, and Markdown
                  </p>
                </div>
              )}
            </div>

            <Select
              label="Subject Track"
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              options={subjects.map((s) => ({ value: s._id, label: s.name }))}
            />

            <Input
              label="Document Title (Optional)"
              type="text"
              placeholder="e.g. Operating Systems Lecture 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {uploading && (
              <div className="space-y-1 pt-1">
                <ProgressBar
                  value={uploadProgress}
                  size="sm"
                  variant="accent"
                  showLabel
                  label="Parsing Content..."
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="indigo"
                size="sm"
                loading={uploading}
                disabled={!file || !subjectId}
              >
                Upload Document
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* YouTube Import Modal */}
      <Modal
        isOpen={showYouTubeModal}
        onClose={() => setShowYouTubeModal(false)}
        title="Import YouTube Video"
        icon={Youtube}
        description="Extract video transcripts and create study modules"
      >
        <div className="space-y-4">
          {ytError && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2 font-mono">
              <AlertCircle size={14} className="shrink-0" />
              <span>{ytError}</span>
            </div>
          )}

          <form onSubmit={handleYouTubeSubmit} className="space-y-4">
            <Input
              label="YouTube Video URL"
              required
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />

            <Select
              label="Subject Track"
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              options={subjects.map((s) => ({ value: s._id, label: s.name }))}
            />

            <Input
              label="Custom Title (Optional)"
              type="text"
              placeholder="e.g. Node.js Event Loop Deep Dive"
              value={ytCustomTitle}
              onChange={(e) => setYtCustomTitle(e.target.value)}
            />

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowYouTubeModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                loading={ytImporting}
                disabled={!youtubeUrl || !subjectId}
              >
                Import Video
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default LibraryPage;

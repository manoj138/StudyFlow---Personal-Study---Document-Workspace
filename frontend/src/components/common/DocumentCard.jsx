import React from "react";
import { FileText, FileCode, CheckCircle2, Trash2, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { SubjectBadge } from "../ui/SubjectBadge";

/**
 * DocumentCard - Standardized Document Card for PDF, DOCX, and TXT workspace files
 * Features a 16:9 Document Cover Banner aligned with Video Card dimensions.
 */
export const DocumentCard = ({
  document: doc,
  onOpen,
  onDelete,
  className = ""
}) => {
  const completionPercentage = doc.progress?.completionPercentage || 0;
  const isCompleted = completionPercentage >= 95;
  const subjectColor = doc.subjectId?.color || "#6366F1";

  const getFileBadge = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return { label: "PDF", bg: "bg-rose-500/20 border-rose-500/40 text-rose-300" };
      case "docx":
      case "doc":
        return { label: "DOCX", bg: "bg-blue-500/20 border-blue-500/40 text-blue-300" };
      default:
        return { label: fileType?.toUpperCase() || "DOC", bg: "bg-purple-500/20 border-purple-500/40 text-purple-300" };
    }
  };

  const badge = getFileBadge(doc.fileType);

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div>
        {/* 16:9 Document Cover Banner */}
        <div
          onClick={() => onOpen(doc._id)}
          className="relative w-full aspect-video overflow-hidden p-4 flex flex-col justify-between cursor-pointer group-hover:brightness-105 transition-all"
          style={{
            background: `linear-gradient(135deg, ${subjectColor}40 0%, rgba(15, 23, 42, 0.95) 100%)`
          }}
        >
          {/* Top Subject Color Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: subjectColor }} />

          {/* Top Row Badges inside Cover */}
          <div className="flex items-center justify-between relative z-10">
            <SubjectBadge subject={doc.subjectId} size="sm" />
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border backdrop-blur-md ${badge.bg}`}>
              .{badge.label}
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

        {/* Content Body */}
        <div className="p-4 space-y-2">
          <h4
            onClick={() => onOpen(doc._id)}
            className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={doc.title}
          >
            {doc.title}
          </h4>
        </div>
      </div>

      {/* Footer Progress & Actions */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Reading Progress</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {isCompleted ? (
                <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> 100% Done
                </span>
              ) : (
                `${completionPercentage}%`
              )}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-white/5 p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionPercentage}%`,
                backgroundColor: isCompleted ? "#10B981" : subjectColor
              }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => onOpen(doc._id)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
          >
            <span>Open Reader</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc._id);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Delete Document"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;

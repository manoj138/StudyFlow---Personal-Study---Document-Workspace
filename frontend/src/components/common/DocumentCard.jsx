import React from "react";
import { FileText, FileCode, CheckCircle2, Trash2, ArrowRight } from "lucide-react";
import { SubjectBadge } from "../ui/SubjectBadge";

/**
 * DocumentCard - Standardized Document Card for PDF, DOCX, and TXT workspace files
 */
export const DocumentCard = ({
  document: doc,
  onOpen,
  onDelete,
  className = ""
}) => {
  const completionPercentage = doc.progress?.completionPercentage || 0;
  const isCompleted = completionPercentage >= 95;

  const getFileBadge = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return { label: "PDF", bg: "bg-rose-500/10 border-rose-500/30 text-rose-300" };
      case "docx":
      case "doc":
        return { label: "DOCX", bg: "bg-blue-500/10 border-blue-500/30 text-blue-300" };
      default:
        return { label: fileType?.toUpperCase() || "DOC", bg: "bg-purple-500/10 border-purple-500/30 text-purple-300" };
    }
  };

  const badge = getFileBadge(doc.fileType);

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-dark-card/90 border border-dark-border/80 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/20 ${className}`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
              <FileText size={20} />
            </div>
            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wider ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          <SubjectBadge subject={doc.subjectId} size="sm" />
        </div>

        {/* Title */}
        <h4
          onClick={() => onOpen(doc._id)}
          className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 cursor-pointer mb-2"
          title={doc.title}
        >
          {doc.title}
        </h4>
      </div>

      {/* Footer Area */}
      <div className="mt-4 pt-3 border-t border-dark-border/60">
        {/* Progress Bar */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Reading Progress</span>
            <span className="font-mono font-bold text-slate-200">
              {isCompleted ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> 100% Done
                </span>
              ) : (
                `${completionPercentage}%`
              )}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted ? "bg-emerald-400" : "bg-gradient-to-r from-indigo-500 to-purple-500"
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => onOpen(doc._id)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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

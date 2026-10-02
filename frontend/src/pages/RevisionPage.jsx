import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Bookmark, MessageSquare, BookOpen, ArrowRight, Sparkles, Highlighter, CheckCircle2, FileText, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "../components/common/EmptyState";
import { SubjectBadge } from "../components/ui/SubjectBadge";

export const RevisionPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRevisionFeed();
  }, []);

  const fetchRevisionFeed = async () => {
    try {
      const res = await API.get("/documents");
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load revision items:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFormatBadge = (filename) => {
    const ext = filename?.split('.').pop()?.toUpperCase() || 'FILE';
    if (ext === 'PDF') return { label: 'PDF', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
    if (ext === 'DOCX' || ext === 'DOC') return { label: 'DOCX', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    if (ext === 'TXT' || ext === 'MD') return { label: ext, bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    return { label: ext, bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans transition-colors duration-200">
      
      {/* Executive Header Banner */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-500/20">
            <GraduationCap className="w-3.5 h-3.5 text-purple-500" /> Study Revision Hub
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Revision Center</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Review all your key bookmarks, highlighted concepts, and personal notes across your study documents.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-white/5 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Documents</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">{documents.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-white/5 text-center min-w-[90px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Revision Mode</span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Active
            </span>
          </div>
        </div>
      </div>

      {/* Revision Documents Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading revision feed...</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/80 p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 max-w-md mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">No study materials yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Upload documents and start reading to add bookmarks, highlights, and notes for revision.
          </p>
          <Link
            to="/library"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all inline-block"
          >
            Go to Document Library
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => {
            const completion = Math.round(doc.progress?.completionPercentage || 0);
            const formatBadge = getFormatBadge(doc.fileName || doc.title || doc.fileType);
            const subjectColor = doc.subjectId?.color || "#6366F1";

            return (
              <motion.div
                key={doc._id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/document/${doc._id}`)}
                className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-white/10 hover:border-purple-500/50 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Subject Color Accent Ribbon */}
                <div 
                  className="h-1.5 w-full" 
                  style={{ backgroundColor: subjectColor }} 
                />

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5"
                      style={{
                        backgroundColor: `${subjectColor}15`,
                        borderColor: `${subjectColor}30`,
                        color: subjectColor
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subjectColor }} />
                      {doc.subjectId?.name || "General"}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${formatBadge.bg}`}>
                      .{formatBadge.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      {doc.totalPages || 1} Pages Total • {completion}% Completed
                    </p>
                  </div>

                  {/* Reading Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-white/5 p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${completion}%`,
                        backgroundColor: subjectColor 
                      }}
                    />
                  </div>

                  {/* Quick Feature Badges & Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Bookmarks
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-500" /> Notes
                      </span>
                    </div>

                    <span className="px-4 py-2 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all">
                      Revise Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

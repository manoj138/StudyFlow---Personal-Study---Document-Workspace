import React from "react";
import { Play, Sparkles, Clock, Trash2, ArrowRight } from "lucide-react";
import { SubjectBadge } from "../ui/SubjectBadge";

/**
 * VideoCard - Standardized YouTube Video Course Card with AI Notes Overlay
 */
export const VideoCard = ({
  document: doc,
  onOpen,
  onDelete,
  className = ""
}) => {
  const thumbnail = doc.youtubeThumbnail || `https://img.youtube.com/vi/${doc.youtubeVideoId}/hqdefault.jpg`;
  const chapterCount = doc.aiChapters?.length || 0;

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-dark-card/90 border border-dark-border/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/30 ${className}`}
    >
      <div>
        {/* 16:9 YouTube Thumbnail Container */}
        <div
          onClick={() => onOpen(doc._id)}
          className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
        >
          <img
            src={thumbnail}
            alt={doc.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Center Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 group-hover:bg-indigo-500 transition-all">
              <Play size={22} className="ml-1 fill-current" />
            </div>
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <SubjectBadge subject={doc.subjectId} size="sm" />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-white font-bold text-[10px] shadow-sm backdrop-blur-md">
              🎬 YouTube Course
            </span>
          </div>

          {/* Bottom AI Chapter Pill */}
          {chapterCount > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles size={12} className="text-amber-400" />
              <span>{chapterCount} AI Chapters</span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4">
          <h4
            onClick={() => onOpen(doc._id)}
            className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 cursor-pointer mb-2"
            title={doc.title}
          >
            {doc.title}
          </h4>

          {doc.aiSummary && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {doc.aiSummary}
            </p>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="px-4 pb-4 pt-2 border-t border-dark-border/40 flex items-center justify-between">
        <button
          onClick={() => onOpen(doc._id)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>Watch & View Notes</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc._id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Video"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCard;

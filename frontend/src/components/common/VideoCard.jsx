import React from "react";
import { Play, Trash2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from "../ui";

/**
 * VideoCard - Standardized YouTube Video Course Card with AI Notes Overlay
 */
export const VideoCard = ({
  document: doc,
  onOpen,
  onDelete,
  className = ""
}) => {
  const thumbnail =
    doc.youtubeThumbnail ||
    `https://img.youtube.com/vi/${doc.youtubeVideoId}/hqdefault.jpg`;
  const chapterCount = doc.aiChapters?.length || 0;

  return (
    <Card
      interactive
      onClick={() => onOpen(doc._id)}
      className={`space-y-3 flex flex-col justify-between overflow-hidden ${className}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 border-b border-zinc-800">
        <img
          src={thumbnail}
          alt={doc.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-zinc-900/90 text-zinc-100 border border-zinc-700/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play size={16} className="ml-0.5 fill-current" />
          </div>
        </div>

        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <Badge variant="neutral" size="sm">
            {doc.subjectId?.name || "General"}
          </Badge>
          <Badge variant="danger" size="sm">
            YouTube
          </Badge>
        </div>
      </div>

      <CardContent className="space-y-2 py-0">
        <h4
          className="text-xs sm:text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug"
          title={doc.title}
        >
          {doc.title}
        </h4>

        {doc.aiSummary ? (
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {doc.aiSummary}
          </p>
        ) : chapterCount > 0 ? (
          <span className="text-[10px] font-mono text-zinc-500">
            {chapterCount} AI Chapters
          </span>
        ) : null}
      </CardContent>

      <CardFooter className="pt-2 text-xs flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
          Watch & Notes <ArrowRight size={12} />
        </span>

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc._id);
            }}
            title="Delete Video"
            className="text-zinc-500 hover:text-rose-400 h-7 w-7 p-0"
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default VideoCard;

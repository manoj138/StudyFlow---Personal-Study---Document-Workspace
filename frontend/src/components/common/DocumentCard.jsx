import React from "react";
import { FileText, FileCode, Trash2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter, Badge, ProgressBar, Button } from "../ui";

/**
 * DocumentCard - Standardized Document Card for PDF, DOCX, TXT, and MD workspace files
 */
export const DocumentCard = ({
  document: doc,
  onOpen,
  onDelete,
  className = ""
}) => {
  const completionPercentage = doc.progress?.completionPercentage || 0;
  const isCompleted = completionPercentage >= 95;

  const getFormatBadge = (fileType, filename) => {
    const ext = (fileType || filename?.split(".").pop() || "").toLowerCase();
    switch (ext) {
      case "pdf":
        return { label: "PDF", variant: "danger" };
      case "docx":
      case "doc":
        return { label: "DOCX", variant: "accent" };
      case "md":
        return { label: "MD", variant: "neutral" };
      case "txt":
        return { label: "TXT", variant: "warning" };
      default:
        return { label: ext ? ext.toUpperCase() : "FILE", variant: "neutral" };
    }
  };

  const badge = getFormatBadge(doc.fileType, doc.fileName || doc.title);

  return (
    <Card
      interactive
      onClick={() => onOpen(doc._id)}
      className={`space-y-3 flex flex-col justify-between ${className}`}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <Badge variant="neutral" size="sm">
          {doc.subjectId?.name || "General"}
        </Badge>
        <Badge variant={badge.variant} size="sm">
          .{badge.label}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 py-0">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0 mt-0.5">
            {badge.label === "MD" ? <FileCode size={15} /> : <FileText size={15} />}
          </div>
          <div className="min-w-0">
            <h4
              className="text-xs sm:text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-white"
              title={doc.title}
            >
              {doc.title}
            </h4>
            <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
              {doc.totalPages || 1} Pages • {completionPercentage}% Read
            </span>
          </div>
        </div>

        <ProgressBar
          value={completionPercentage}
          size="xs"
          variant={isCompleted ? "success" : "neutral"}
        />
      </CardContent>

      <CardFooter className="pt-2 text-xs flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
          Open Document <ArrowRight size={12} />
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
            title="Delete Document"
            className="text-zinc-500 hover:text-rose-400 h-7 w-7 p-0"
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;

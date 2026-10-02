import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/Button";

/**
 * EmptyState - Standardized empty state component for lists, search, and documents
 */
export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No items found",
  description = "There are no items matching your request right now.",
  actionLabel,
  onAction,
  actionIcon,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-dark-card/50 border border-dark-border/60 backdrop-blur-sm ${className}`}>
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
        <div className="relative p-4 sm:p-5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
          <Icon size={36} className="sm:w-10 sm:h-10" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <Button onClick={onAction} icon={actionIcon} variant="gradient" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

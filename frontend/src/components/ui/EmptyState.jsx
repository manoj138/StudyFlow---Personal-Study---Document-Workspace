import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

/**
 * EmptyState - Enterprise Geometric Empty State Surface
 * Replaces legacy common/EmptyState.jsx with 1px border and standard typography.
 */
export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No records found",
  description = "There are no matching items for this query.",
  actionLabel,
  onAction,
  actionIcon,
  actionVariant = "primary",
  className = ""
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg bg-[#121215]/60 border border-dashed border-zinc-800 space-y-3 ${className}`}
    >
      <div className="w-10 h-10 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 flex items-center justify-center mx-auto">
        <Icon size={20} />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">{title}</h3>
        {description && (
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button
            onClick={onAction}
            icon={actionIcon}
            variant={actionVariant}
            size="sm"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;

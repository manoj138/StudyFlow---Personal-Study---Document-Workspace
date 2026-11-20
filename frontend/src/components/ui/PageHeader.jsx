import React from "react";

/**
 * PageHeader - Developer Cockpit Command Strip
 * Replaces mismatched hero banners with a consistent, sharp header.
 */
export const PageHeader = ({
  breadcrumb,
  title,
  description,
  actions,
  className = ""
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80 ${className}`}
    >
      <div className="space-y-1">
        {breadcrumb && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            {breadcrumb}
          </div>
        )}
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100 leading-snug">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

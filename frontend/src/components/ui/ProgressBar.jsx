import React from "react";

/**
 * ProgressBar - Linear Quantitative Completion Indicator
 */
export const ProgressBar = ({
  value = 0,
  max = 100,
  size = "md",
  variant = "neutral",
  showLabel = false,
  label,
  className = ""
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizes = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2",
    lg: "h-2.5"
  };

  const variants = {
    neutral: "bg-zinc-200",
    accent: "bg-indigo-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500"
  };

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>{label || "Progress"}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        className={`w-full bg-zinc-900 border border-zinc-800/80 rounded-[2px] overflow-hidden ${sizes[size] || sizes.md}`}
      >
        <div
          className={`h-full transition-all duration-300 rounded-[1px] ${variants[variant] || variants.neutral}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

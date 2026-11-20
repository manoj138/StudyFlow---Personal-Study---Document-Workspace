import React from "react";

/**
 * MetricCard - High-Density Quantitative Tile
 * Linear/Raycast standard: JetBrains Mono digits, 1px border, compact layout.
 */
export const MetricCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  className = "",
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-zinc-800 bg-[#121215] p-4 text-zinc-100 shadow-sm flex flex-col justify-between gap-2.5 transition-colors ${
        onClick ? "cursor-pointer hover:border-zinc-700" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        {Icon && <Icon size={15} className="text-zinc-500 shrink-0" />}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-mono font-bold text-zinc-100 tracking-tight leading-none">
          {value}
        </div>
        {(subtext || trend) && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            {trend && <span className="font-semibold text-zinc-300">{trend}</span>}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;

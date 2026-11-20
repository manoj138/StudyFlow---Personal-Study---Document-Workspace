import React from "react";

/**
 * MetricCard - High-Density Quantitative Tile with Specular Highlight
 * Linear/Raycast standard: Tabular figures, micro-glow corner, physical bevel.
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
      className={`rounded-lg specular-card-interactive p-4 text-zinc-100 flex flex-col justify-between gap-3 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        {Icon && (
          <div className="p-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-400 shrink-0">
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-mono font-bold text-zinc-100 tracking-tight leading-none tabular-nums">
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

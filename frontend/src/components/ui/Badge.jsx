import React from "react";

/**
 * Badge - Monochromatic & Status Metadata Pill
 * Compact geometric 6px radius, strictly no childish emojis.
 */
export const Badge = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  icon: Icon
}) => {
  const variants = {
    neutral: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    accent: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
    outline: "bg-transparent text-zinc-400 border-zinc-800"
  };

  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-[11px] px-2 py-0.5 gap-1.5",
    lg: "text-xs px-2.5 py-1 gap-2"
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-md border tracking-wide uppercase select-none ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && <Icon size={size === "sm" ? 10 : 12} className="shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

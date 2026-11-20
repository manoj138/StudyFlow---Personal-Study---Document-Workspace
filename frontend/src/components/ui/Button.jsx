import React from "react";
import { Loader2 } from "lucide-react";
import { Kbd } from "./Kbd";

/**
 * Button - Precision Interactive Control with Specular Bevels
 * Linear/Vercel standard: Dual-tone bevel, physical top highlight, native Kbd shortcut.
 */
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  shortcut,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus:ring-1 focus:ring-white/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none tracking-tight";

  const variants = {
    primary:
      "bg-white hover:bg-zinc-100 text-zinc-950 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_3px_rgba(0,0,0,0.6)] border border-white/30",
    indigo:
      "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.5)] border border-indigo-400/40 hover:shadow-[0_0_16px_rgba(99,102,241,0.3)]",
    secondary:
      "bg-[#141720] hover:bg-[#1C202C] text-zinc-200 border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.4)]",
    outline:
      "bg-transparent hover:bg-white/[0.04] text-zinc-300 border border-white/[0.1] hover:border-white/[0.18]",
    ghost:
      "bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-100",
    danger:
      "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[inset_0_1px_0_rgba(244,63,94,0.15)]",
    warning:
      "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",
    success:
      "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[inset_0_1px_0_rgba(16,185,129,0.15)]",
    subtle:
      "bg-[#0E1015] hover:bg-[#141720] text-zinc-200 border border-white/[0.06]"
  };

  const sizes = {
    sm: "h-8 px-2.5 text-xs gap-1.5",
    md: "h-9 px-3.5 text-xs gap-2",
    lg: "h-10 px-4 text-sm gap-2"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin text-current shrink-0" size={size === "sm" ? 12 : 14} />
      ) : Icon ? (
        <Icon className="shrink-0" size={size === "sm" ? 13 : 15} />
      ) : null}
      <span>{children}</span>
      {shortcut && <Kbd className="ml-1.5">{shortcut}</Kbd>}
    </button>
  );
};

export default Button;

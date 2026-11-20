  import React from "react";
import { Loader2 } from "lucide-react";
import { Kbd } from "./Kbd";

/**
 * Button - Precision Interactive Control
 * Sharp 6px radius, Linear/Vercel standard, native Kbd shortcut integration.
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
    "inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

  const variants = {
    primary:
      "bg-zinc-100 hover:bg-white text-zinc-950 font-semibold shadow-sm border border-zinc-200",
    indigo:
      "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm border border-indigo-500",
    secondary:
      "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 shadow-sm",
    outline:
      "bg-transparent hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:border-zinc-700",
    ghost:
      "bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100",
    danger:
      "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30",
    warning:
      "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30",
    success:
      "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    subtle:
      "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50"
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

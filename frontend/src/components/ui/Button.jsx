import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Button - Standardized UI button component supporting variants, loading state, and icons
 */
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30",
    gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-indigo-300/30",
    secondary: "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 hover:border-slate-600",
    outline: "bg-transparent hover:bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60",
    glass: "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md",
    danger: "bg-rose-600/80 hover:bg-rose-500 text-white border border-rose-500/40 shadow-lg shadow-rose-600/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5 font-bold"
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
        <Loader2 className="animate-spin text-current shrink-0" size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      ) : Icon ? (
        <Icon className="shrink-0" size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;

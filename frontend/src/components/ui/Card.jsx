import React from "react";

/**
 * Card Suite - Enterprise Geometric Surface with Specular Lighting
 * Linear/Raycast standard: Dual-tone bevel, physical top highlight, ambient shadow.
 */
export const Card = ({
  children,
  className = "",
  interactive = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg ${
        interactive
          ? "specular-card-interactive cursor-pointer"
          : "specular-card"
      } text-zinc-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`p-4 sm:p-5 border-b border-white/[0.06] flex flex-col gap-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h3
      className={`text-sm sm:text-base font-semibold text-zinc-100 tracking-tight leading-snug ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = "", ...props }) => {
  return (
    <p
      className={`text-xs text-zinc-400 leading-relaxed font-sans ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`p-3 sm:p-4 border-t border-white/[0.06] bg-[#08090C]/50 rounded-b-lg flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

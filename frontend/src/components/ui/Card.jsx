import React from "react";

/**
 * Card Suite - Enterprise Geometric Surface System
 * Standard 1px border, 8px radius, flat zinc dark background.
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
      className={`rounded-lg border border-zinc-800 bg-[#121215] text-zinc-100 shadow-sm ${
        interactive
          ? "cursor-pointer hover:border-zinc-700 transition-colors"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`p-4 sm:p-5 border-b border-zinc-800/80 flex flex-col gap-1 ${className}`}
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
      className={`text-xs text-zinc-400 leading-relaxed ${className}`}
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
      className={`p-3 sm:p-4 border-t border-zinc-800/80 bg-zinc-950/40 rounded-b-lg flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

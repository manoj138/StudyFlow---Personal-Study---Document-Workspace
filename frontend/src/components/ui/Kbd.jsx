import React from "react";

/**
 * Kbd - Precision Mechanical Keycap Component
 * Used in shortcuts, command palettes, and button indicators.
 */
export const Kbd = ({ children, className = "" }) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800/90 text-zinc-300 shadow-[0_1px_0_1px_rgba(0,0,0,0.5)] select-none leading-none ${className}`}
    >
      {children}
    </kbd>
  );
};

export default Kbd;

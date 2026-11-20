import React from "react";

/**
 * Kbd - Precision Mechanical Keycap with 3D Bevel
 */
export const Kbd = ({ children, className = "" }) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-[4px] border border-white/[0.12] bg-[#141720] text-zinc-300 shadow-[0_1px_0_1px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] select-none leading-none tracking-wider ${className}`}
    >
      {children}
    </kbd>
  );
};

export default Kbd;

import React, { useState, useRef, useEffect } from "react";

/**
 * Dropdown - Context & Action Menu
 */
export const Dropdown = ({
  trigger,
  children,
  align = "right",
  className = ""
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const alignStyles = align === "left" ? "left-0" : "right-0";

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className={`absolute z-50 mt-1 min-w-[160px] rounded-md border border-white/[0.12] bg-[#141720] p-1 text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_12px_28px_-6px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-100 ${alignStyles} ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  icon: Icon,
  danger = false,
  className = ""
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-2.5 py-1.5 text-xs rounded-[4px] font-medium transition-colors flex items-center gap-2 cursor-pointer select-none text-left ${
        danger
          ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
          : "text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100"
      } ${className}`}
    >
      {Icon && <Icon size={13} className="shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export const DropdownSeparator = () => (
  <div className="my-1 border-t border-white/[0.08]" />
);

export default Dropdown;

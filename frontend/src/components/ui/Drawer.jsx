import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Drawer - Slide-Over Panel for sidebars, TOC, and concept notes
 */
export const Drawer = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  side = "right", // "right" or "left"
  width = "max-w-md",
  className = ""
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sideStyles =
    side === "left"
      ? "left-0 border-r animate-in slide-in-from-left duration-200"
      : "right-0 border-l animate-in slide-in-from-right duration-200";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full ${width} h-full bg-[#121215] border-zinc-800 text-zinc-100 shadow-2xl flex flex-col justify-between ${sideStyles} ${className}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                <Icon size={15} />
              </div>
            )}
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">{title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Drawer;

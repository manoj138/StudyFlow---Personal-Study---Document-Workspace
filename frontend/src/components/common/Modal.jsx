import React, { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Modal - Universal glassmorphism modal dialog component with backdrop blur
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  maxWidth = "max-w-md",
  footer,
  className = ""
}) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className={`relative z-10 w-full ${maxWidth} overflow-hidden rounded-3xl bg-[#0B1120] border border-dark-border/90 shadow-2xl shadow-indigo-950/40 transform transition-all duration-300 scale-100 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Icon size={18} />
              </div>
            )}
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-border/80 bg-slate-900/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

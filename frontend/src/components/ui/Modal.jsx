import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Modal - Enterprise Glassmorphism Dialog Suite
 * Replaces legacy common/Modal.jsx with 8px radius and standard 1px borders.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  description,
  children,
  footer,
  maxWidth = "max-w-md",
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full ${maxWidth} overflow-hidden rounded-lg bg-[#141720] border border-white/[0.12] text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),0_16px_36px_-8px_rgba(0,0,0,0.85)] transition-all duration-150 ${className}`}
      >
        {(title || Icon) && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#0E1015]/80">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <div className="p-1.5 rounded-md bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                  <Icon size={15} />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
                  {title}
                </h3>
                {description && (
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.08] bg-[#0E1015]/80">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export const ModalHeader = ({ children, className = "" }) => (
  <div className={`px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const ModalTitle = ({ children, className = "" }) => (
  <h3 className={`text-sm font-semibold text-zinc-100 tracking-tight ${className}`}>
    {children}
  </h3>
);

export const ModalBody = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

export const ModalFooter = ({ children, className = "" }) => (
  <div className={`px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-end gap-2 ${className}`}>
    {children}
  </div>
);

export default Modal;

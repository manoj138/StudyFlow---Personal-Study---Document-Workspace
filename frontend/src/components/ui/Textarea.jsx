import React from "react";
import { FormField } from "./Input";

/**
 * Textarea - Multi-Line Monospace/Sans Syntax Area
 */
export const Textarea = ({
  label,
  error,
  helperText,
  required,
  mono = true,
  rows = 4,
  className = "",
  disabled = false,
  ...props
}) => {
  const textareaEl = (
    <textarea
      rows={rows}
      disabled={disabled}
      className={`w-full p-3 text-xs sm:text-sm bg-[#08090C] text-zinc-100 placeholder-zinc-500 rounded-md border transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed ${
        mono ? "font-mono" : "font-sans"
      } ${
        error
          ? "border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/20"
          : "border-white/[0.08] hover:border-white/[0.14] focus:border-white/[0.25]"
      } ${className}`}
      {...props}
    />
  );

  if (label || error || helperText) {
    return (
      <FormField label={label} error={error} helperText={helperText} required={required}>
        {textareaEl}
      </FormField>
    );
  }

  return textareaEl;
};

export default Textarea;

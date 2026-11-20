import React from "react";

/**
 * FormField - Label and validation wrapper for input controls
 */
export const FormField = ({
  label,
  error,
  helperText,
  required = false,
  children,
  className = ""
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[11px] font-mono text-rose-400 leading-tight">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] font-mono text-zinc-500 leading-tight">{helperText}</p>
      ) : null}
    </div>
  );
};

/**
 * Input - Standard Geometric 1px Border Input Control
 */
export const Input = ({
  label,
  error,
  helperText,
  required,
  icon: Icon,
  suffix,
  mono = false,
  className = "",
  type = "text",
  disabled = false,
  ...props
}) => {
  const inputEl = (
    <div className="relative flex items-center w-full">
      {Icon && (
        <Icon
          size={14}
          className="absolute left-3 text-zinc-500 pointer-events-none shrink-0"
        />
      )}
      <input
        type={type}
        disabled={disabled}
        className={`w-full h-9 px-3 text-xs sm:text-sm bg-zinc-950 text-zinc-100 placeholder-zinc-500 rounded-md border transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
          Icon ? "pl-9" : ""
        } ${suffix ? "pr-9" : ""} ${
          mono ? "font-mono" : "font-sans"
        } ${
          error
            ? "border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/20"
            : "border-zinc-800 hover:border-zinc-700 focus:border-zinc-400"
        } ${className}`}
        {...props}
      />
      {suffix && (
        <div className="absolute right-3 flex items-center text-zinc-500">
          {suffix}
        </div>
      )}
    </div>
  );

  if (label || error || helperText) {
    return (
      <FormField label={label} error={error} helperText={helperText} required={required}>
        {inputEl}
      </FormField>
    );
  }

  return inputEl;
};

export default Input;

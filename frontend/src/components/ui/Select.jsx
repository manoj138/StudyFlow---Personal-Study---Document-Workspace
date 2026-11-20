import React from "react";
import { ChevronDown } from "lucide-react";
import { FormField } from "./Input";

/**
 * Select - Geometric High-Density Dropdown
 */
export const Select = ({
  label,
  error,
  helperText,
  required,
  options = [],
  children,
  className = "",
  disabled = false,
  ...props
}) => {
  const selectEl = (
    <div className="relative flex items-center w-full">
      <select
        disabled={disabled}
        className={`w-full h-9 pl-3 pr-8 text-xs sm:text-sm bg-[#08090C] text-zinc-100 rounded-md border appearance-none transition-colors duration-150 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans ${
          error
            ? "border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/20"
            : "border-white/[0.08] hover:border-white/[0.14] focus:border-white/[0.25]"
        } ${className}`}
        {...props}
      >
        {options.length > 0
          ? options.map((opt) => (
              <option
                key={opt.value ?? opt._id ?? opt.id}
                value={opt.value ?? opt._id ?? opt.id}
                className="bg-[#08090C] text-zinc-100"
              >
                {opt.label ?? opt.name ?? opt.title}
              </option>
            ))
          : children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 text-zinc-500 pointer-events-none shrink-0"
      />
    </div>
  );

  if (label || error || helperText) {
    return (
      <FormField label={label} error={error} helperText={helperText} required={required}>
        {selectEl}
      </FormField>
    );
  }

  return selectEl;
};

export default Select;

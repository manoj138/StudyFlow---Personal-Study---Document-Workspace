import React from "react";
import { Search, X } from "lucide-react";

/**
 * SearchBar - Reusable search input with icon, clear button, and sleek glass styling
 */
export const SearchBar = ({
  value = "",
  onChange,
  placeholder = "Search documents, subjects...",
  onClear,
  className = "",
  size = "md"
}) => {
  const sizeStyles = {
    sm: "py-1.5 pl-9 pr-8 text-xs",
    md: "py-2.5 pl-10 pr-9 text-sm",
    lg: "py-3 pl-11 pr-10 text-base"
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 20
  };

  const currentIconSize = iconSizes[size] || 18;

  const handleClear = () => {
    if (onClear) onClear();
    else if (onChange) onChange({ target: { value: "" } });
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search
        size={currentIconSize}
        className="absolute left-3.5 text-slate-400 pointer-events-none transition-colors group-focus-within:text-indigo-400"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-[#0F172A]/80 border border-dark-border/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all ${sizeStyles[size] || sizeStyles.md}`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Clear search"
        >
          <X size={currentIconSize - 4} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

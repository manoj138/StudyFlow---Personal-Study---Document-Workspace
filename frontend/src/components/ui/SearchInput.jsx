import React from "react";
import { Search, X } from "lucide-react";
import { Kbd } from "./Kbd";

/**
 * SearchInput - High-Density Global/Local Search Bar
 * 36px standard height, clear action, native Kbd shortcut indicator.
 */
export const SearchInput = ({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  shortcut = "/",
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search
        size={14}
        className="absolute left-3 text-zinc-500 pointer-events-none shrink-0"
      />

      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-14 text-xs sm:text-sm bg-[#08090C] text-zinc-100 placeholder-zinc-500 rounded-md border border-white/[0.08] hover:border-white/[0.14] focus:border-white/[0.25] focus:outline-none transition-colors duration-150 font-mono disabled:opacity-50"
        {...props}
      />

      <div className="absolute right-2.5 flex items-center gap-1">
        {value && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Clear search"
          >
            <X size={13} />
          </button>
        ) : shortcut ? (
          <Kbd className="opacity-70">{shortcut}</Kbd>
        ) : null}
      </div>
    </div>
  );
};

export default SearchInput;

import React from "react";

/**
 * SegmentedTabs - Monochromatic High-Density Tab Switcher
 * Zero bouncy animations, sharp 6px radius, Linear standard.
 */
export const SegmentedTabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = ""
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-md bg-[#08090C] border border-white/[0.08] text-xs font-medium ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1 rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer select-none font-medium text-xs ${
              isActive
                ? "bg-[#1C202C] text-zinc-100 shadow-sm border border-white/[0.12]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            {Icon && <Icon size={13} className={isActive ? "text-zinc-200" : "text-zinc-500"} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive ? "bg-white/[0.1] text-zinc-200" : "bg-white/[0.04] text-zinc-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedTabs;

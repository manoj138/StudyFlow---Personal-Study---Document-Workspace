import React from "react";

/**
 * SubjectBadge - Reusable subject tag pill with dynamic color accents & glassmorphism
 * @param {Object} subject - { name, color, icon }
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className - Optional additional CSS classes
 */
export const SubjectBadge = ({ subject, size = "md", className = "" }) => {
  if (!subject) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        General
      </span>
    );
  }

  const name = typeof subject === "string" ? subject : subject.name || "General";
  const color = typeof subject === "object" ? subject.color || "indigo" : "indigo";
  const icon = typeof subject === "object" ? subject.icon : null;

  const colorStyles = {
    indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 dot-indigo-400",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/30 dot-purple-400",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 dot-emerald-400",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30 dot-amber-400",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30 dot-rose-400",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 dot-cyan-400",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/30 dot-blue-400"
  };

  const dots = {
    indigo: "bg-indigo-400",
    purple: "bg-purple-400",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    cyan: "bg-cyan-400",
    blue: "bg-blue-400"
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2 font-bold"
  };

  const selectedStyle = colorStyles[color] || colorStyles.indigo;
  const dotBg = dots[color] || dots.indigo;

  return (
    <span className={`inline-flex items-center rounded-full font-semibold border backdrop-blur-sm shadow-sm transition-all ${sizes[size] || sizes.md} ${selectedStyle} ${className}`}>
      {icon ? (
        <span className="text-xs">{icon}</span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${dotBg} animate-pulse shrink-0`}></span>
      )}
      <span className="truncate">{name}</span>
    </span>
  );
};

export default SubjectBadge;

import React from "react";

/**
 * StatCard - Reusable KPI Metric Card for Dashboard & Workspaces
 */
export const StatCard = ({
  title,
  value,
  icon: Icon,
  colorTheme = "indigo",
  trend,
  subtext,
  onClick,
  className = ""
}) => {
  const themes = {
    indigo: {
      border: "border-indigo-500/20 hover:border-indigo-500/40",
      glow: "from-indigo-500/10 via-transparent to-transparent",
      iconBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      badge: "bg-indigo-500/10 text-indigo-300"
    },
    purple: {
      border: "border-purple-500/20 hover:border-purple-500/40",
      glow: "from-purple-500/10 via-transparent to-transparent",
      iconBg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      badge: "bg-purple-500/10 text-purple-300"
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      glow: "from-emerald-500/10 via-transparent to-transparent",
      iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      badge: "bg-emerald-500/10 text-emerald-300"
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/40",
      glow: "from-amber-500/10 via-transparent to-transparent",
      iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      badge: "bg-amber-500/10 text-amber-300"
    }
  };

  const theme = themes[colorTheme] || themes.indigo;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-dark-card/90 border p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${onClick ? "cursor-pointer" : ""} ${theme.border} ${className}`}
    >
      {/* Background Subtle Gradient Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow} opacity-50 group-hover:opacity-100 transition-opacity`} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${theme.iconBg} shadow-inner transition-transform group-hover:scale-110`}>
            <Icon size={22} />
          </div>
        )}
      </div>

      {(trend || subtext) && (
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {trend && <span className={`font-semibold px-2 py-0.5 rounded-md ${theme.badge}`}>{trend}</span>}
          {subtext && <span className="text-slate-400 font-medium">{subtext}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;

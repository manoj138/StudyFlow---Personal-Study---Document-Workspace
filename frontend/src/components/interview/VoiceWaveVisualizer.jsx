import React from "react";
import { motion } from "framer-motion";
import { Volume2, Mic, Bot } from "lucide-react";

export const VoiceWaveVisualizer = ({
  isActive = false,
  role = "interviewer", // "interviewer" | "candidate"
  label = ""
}) => {
  const isInterviewer = role === "interviewer";

  // Gradient colors for waves
  const waveColor = isInterviewer
    ? "from-indigo-500 to-purple-500"
    : "from-emerald-500 to-teal-400";

  const glowColor = isInterviewer
    ? "rgba(99, 102, 241, 0.25)"
    : "rgba(16, 185, 129, 0.25)";

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-2">
      {/* Visualizer Container */}
      <div
        className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 border border-slate-700/60 shadow-lg transition-all duration-300"
        style={{
          boxShadow: isActive ? `0 0 28px ${glowColor}` : "none"
        }}
      >
        {/* Animated Ripple Pulse Rings when active */}
        {isActive && (
          <>
            <motion.div
              className={`absolute inset-0 rounded-full border ${
                isInterviewer ? "border-indigo-500/40" : "border-emerald-500/40"
              }`}
              animate={{
                scale: [1, 1.4, 1.7],
                opacity: [0.8, 0.3, 0]
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            <motion.div
              className={`absolute inset-0 rounded-full border ${
                isInterviewer ? "border-purple-500/30" : "border-teal-500/30"
              }`}
              animate={{
                scale: [1, 1.25, 1.5],
                opacity: [0.6, 0.2, 0]
              }}
              transition={{
                duration: 1.6,
                delay: 0.4,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </>
        )}

        {/* Center Icon */}
        <div
          className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${
            isActive
              ? isInterviewer
                ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30"
                : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30"
              : "bg-slate-800 text-slate-400 border border-slate-700"
          }`}
        >
          {isInterviewer ? (
            <Bot className={`w-7 h-7 sm:w-8 sm:h-8 ${isActive ? "animate-pulse" : ""}`} />
          ) : (
            <Mic className={`w-7 h-7 sm:w-8 sm:h-8 ${isActive ? "animate-bounce" : ""}`} />
          )}
        </div>
      </div>

      {/* Audio Waveform Bars */}
      <div className="flex items-center gap-1.5 h-7 px-3">
        {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9, 0.3, 0.7].map((heightFactor, idx) => (
          <motion.span
            key={idx}
            className={`w-1 rounded-full bg-gradient-to-t ${waveColor}`}
            animate={{
              height: isActive ? [`${heightFactor * 10}px`, `${heightFactor * 26}px`, `${heightFactor * 8}px`] : "5px",
              opacity: isActive ? [0.6, 1, 0.7] : 0.25
            }}
            transition={{
              duration: 0.65,
              repeat: isActive ? Infinity : 0,
              delay: idx * 0.07,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Status Label */}
      {label && (
        <span
          className={`text-xs font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${
            isActive
              ? isInterviewer
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
};


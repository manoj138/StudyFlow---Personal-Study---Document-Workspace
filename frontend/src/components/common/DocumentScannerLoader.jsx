import React from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, GraduationCap } from "lucide-react";

export const DocumentScannerLoader = ({
  message = "Loading StudyFlow Workspace Reader...",
  fullScreen = true
}) => {
  const containerClasses = fullScreen
    ? "min-h-screen bg-slate-50 dark:bg-[#080C14] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30 transition-colors duration-200 relative z-30"
    : "py-12 px-6 bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center text-center transition-colors duration-200 relative overflow-hidden";

  return (
    <div className={containerClasses}>
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Scanner Card Container */}
      <div className="relative flex flex-col items-center gap-6 z-10">
        
        {/* PDF Document Graphic Container */}
        <div className="relative w-28 h-36 bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-500/30 dark:border-cyan-500/40 shadow-xl overflow-hidden p-3.5 flex flex-col justify-between group">
          
          {/* Top PDF Ribbon / Fold Corner */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2">
            <span className="text-[10px] font-extrabold font-mono text-indigo-600 dark:text-cyan-400 bg-indigo-500/10 dark:bg-cyan-500/15 px-2 py-0.5 rounded-md border border-indigo-500/20 dark:border-cyan-500/30">
              PDF
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </div>

          {/* Skeleton Document Lines */}
          <div className="space-y-2 py-1">
            <div className="h-1.5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-1.5 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-1.5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>

          {/* Document Footer Icon */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/10">
            <GraduationCap className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
            <span className="text-[9px] font-mono text-slate-400">SCAN</span>
          </div>

          {/* Glowing Laser Scan Beam (Sliding Up and Down) */}
          <motion.div
            animate={{ y: [0, 110, 0] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute left-0 right-0 top-1 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] z-20 pointer-events-none"
          >
            {/* Shimmer Tail behind Laser */}
            <div className="w-full h-6 bg-gradient-to-b from-cyan-400/20 to-transparent -translate-y-6 pointer-events-none" />
          </motion.div>
        </div>

        {/* Dynamic Status Text */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
              {message}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
            Parsing document structure & active study nodes...
          </span>
        </div>

      </div>
    </div>
  );
};

export default DocumentScannerLoader;

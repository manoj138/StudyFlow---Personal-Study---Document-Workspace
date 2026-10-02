import React, { useState } from "react";
import { Sparkles, CheckCircle2, MousePointerClick } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const DemoButton = ({ label = "Click Me" }) => {
  const [clickCount, setClickCount] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const handleClick = () => {
    setClickCount((prev) => prev + 1);
    setShowToast(true);
  };

  return (
    <div className="my-3 inline-block font-sans">
      <div className="flex items-center gap-3">
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/30"
        >
          <MousePointerClick className="w-4 h-4 text-indigo-200 animate-pulse" />
          <span>{label}</span>
          {clickCount > 0 && (
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
              {clickCount}
            </span>
          )}
        </button>
      </div>

      {/* Interactive Toast Result Box */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2.5 p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs shadow-xl flex items-center justify-between gap-3 max-w-md"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">✨ JavaScript Event Triggered!</span>
                <span className="text-[11px] text-indigo-300">
                  Button click event fired successfully • Total Clicks: <span className="font-bold text-white font-mono">{clickCount}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

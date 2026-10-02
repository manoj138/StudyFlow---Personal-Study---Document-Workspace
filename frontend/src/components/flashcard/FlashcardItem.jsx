import React, { useState } from "react";
import { HelpCircle, CheckCircle2, RotateCw } from "lucide-react";

/**
 * FlashcardItem - Reusable 3D Flip Card Component with Active Recall Rating
 */
export const FlashcardItem = ({
  card,
  index,
  onRate,
  showRatings = true,
  className = ""
}) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      {/* 3D Card Flip Container */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="group relative w-full h-64 sm:h-72 cursor-pointer perspective-1000"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* FRONT SIDE - Question */}
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-b from-[#111827] to-[#0B1120] border border-indigo-500/30 shadow-xl backdrop-blur-md backface-hidden">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-xs">
                <HelpCircle size={14} />
                Question #{index !== undefined ? index + 1 : 1}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                <RotateCw size={12} /> Click to flip
              </span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {card.question}
              </p>
            </div>

            <div className="text-center text-xs text-slate-500">
              Tap card to reveal answer
            </div>
          </div>

          {/* BACK SIDE - Answer */}
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-b from-[#0F172A] to-[#020617] border border-emerald-500/40 shadow-xl backdrop-blur-md rotate-y-180 backface-hidden">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                <CheckCircle2 size={14} />
                Answer Breakdown
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <RotateCw size={12} /> Click to flip back
              </span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                {card.answer}
              </p>
            </div>

            <div className="text-center text-xs text-emerald-400 font-medium">
              Recall verified
            </div>
          </div>
        </div>
      </div>

      {/* Optional Rating Action Controls */}
      {showRatings && onRate && (
        <div className="flex items-center justify-center gap-3 mt-4 w-full max-w-sm">
          <button
            onClick={() => onRate(card, "hard")}
            className="flex-1 py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 font-bold text-xs hover:bg-rose-900/60 transition-colors"
          >
            🔴 Hard
          </button>
          <button
            onClick={() => onRate(card, "good")}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-900/60 transition-colors"
          >
            🟡 Good
          </button>
          <button
            onClick={() => onRate(card, "easy")}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:bg-emerald-900/60 transition-colors"
          >
            🟢 Easy
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardItem;

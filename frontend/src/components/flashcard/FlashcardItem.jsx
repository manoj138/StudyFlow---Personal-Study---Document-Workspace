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
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-6 rounded-lg bg-[#0E1015] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_-4px_rgba(0,0,0,0.7)] backface-hidden">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-mono text-xs">
                <HelpCircle size={13} />
                Question #{index !== undefined ? index + 1 : 1}
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1 group-hover:text-zinc-300 transition-colors font-mono">
                <RotateCw size={12} /> Flip
              </span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-base sm:text-lg font-semibold text-zinc-100 leading-relaxed">
                {card.question}
              </p>
            </div>

            <div className="text-center text-xs text-zinc-500 font-mono">
              Space / Click to reveal
            </div>
          </div>

          {/* BACK SIDE - Answer */}
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-6 rounded-lg bg-[#0E1015] border border-emerald-500/30 shadow-[inset_0_1px_0_rgba(16,185,129,0.15),0_8px_24px_-4px_rgba(0,0,0,0.7)] rotate-y-180 backface-hidden">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs">
                <CheckCircle2 size={13} />
                Answer Breakdown
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                <RotateCw size={12} /> Flip back
              </span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-sans">
                {card.answer}
              </p>
            </div>

            <div className="text-center text-xs text-emerald-400 font-mono">
              Recall verified
            </div>
          </div>
        </div>
      </div>

      {/* Optional Rating Action Controls */}
      {showRatings && onRate && (
        <div className="flex items-center justify-center gap-2 mt-4 w-full max-w-sm font-mono">
          <button
            onClick={() => onRate(card, "hard")}
            className="flex-1 py-1.5 px-3 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400 font-medium text-xs hover:bg-rose-500/20 transition-colors shadow-sm"
          >
            1 Hard
          </button>
          <button
            onClick={() => onRate(card, "good")}
            className="flex-1 py-1.5 px-3 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 font-medium text-xs hover:bg-amber-500/20 transition-colors shadow-sm"
          >
            2 Good
          </button>
          <button
            onClick={() => onRate(card, "easy")}
            className="flex-1 py-1.5 px-3 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-medium text-xs hover:bg-emerald-500/20 transition-colors shadow-sm"
          >
            3 Easy
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardItem;

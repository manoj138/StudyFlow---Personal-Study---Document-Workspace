import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle,
  Circle,
  Clock,
  Download,
  Flame,
  Lightbulb,
  Printer,
  Search,
  Sparkles,
  Target,
  Wrench,
  Trophy,
  Filter,
  CheckSquare,
  Check,
  Share2
} from "lucide-react";
import {
  getChallengeById,
  toggleSubTask
} from "../services/challengeService";
import { DocumentScannerLoader } from "../components/common/DocumentScannerLoader";

export const ChallengeViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "pending" | "completed"
  const [selectedPhase, setSelectedPhase] = useState("all");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, [id]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const data = await getChallengeById(id);
      if (data?.success && data.challenge) {
        setChallenge(data.challenge);
      } else {
        setError("Could not find this study challenge.");
      }
    } catch (err) {
      console.error("Load challenge error:", err);
      setError("Failed to load study challenge details.");
    } finally {
      setLoading(false);
    }
  };

  // Optimistic Toggle Subtask
  const handleToggleTask = async (dayNumber, taskId, currentCompleted) => {
    if (!challenge) return;

    const nextCompleted = !currentCompleted;

    // Optimistically update local state
    setChallenge((prev) => {
      if (!prev) return prev;
      let total = 0;
      let done = 0;

      const nextDays = prev.days.map((d) => {
        if (d.dayNumber !== dayNumber) {
          d.subTasks.forEach((t) => {
            total++;
            if (t.completed) done++;
          });
          return d;
        }

        let dayAllDone = true;
        const nextSubTasks = d.subTasks.map((t) => {
          total++;
          if (t.id === taskId || t._id === taskId) {
            if (nextCompleted) done++;
            return { ...t, completed: nextCompleted, completedAt: nextCompleted ? new Date() : null };
          }
          if (t.completed) done++;
          else dayAllDone = false;
          return t;
        });

        // Check if all subtasks in updated day are complete
        const allCompletedInThisDay = nextSubTasks.length > 0 && nextSubTasks.every((t) => t.completed);

        return {
          ...d,
          subTasks: nextSubTasks,
          isDayCompleted: allCompletedInThisDay
        };
      });

      const nextPct = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        ...prev,
        days: nextDays,
        totalTasks: total,
        completedTasks: done,
        progressPercent: nextPct
      };
    });

    // Sync to backend
    try {
      await toggleSubTask({
        challengeId: challenge._id,
        dayNumber,
        taskId,
        completed: nextCompleted
      });
    } catch (err) {
      console.error("Failed to sync task toggle:", err);
      // Revert if backend error
      loadChallenge();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered Days
  const filteredDays = useMemo(() => {
    if (!challenge?.days) return [];

    return challenge.days.filter((day) => {
      // Phase Filter
      if (selectedPhase !== "all" && day.phase !== selectedPhase) {
        return false;
      }

      // Status Filter
      if (activeFilter === "completed" && !day.isDayCompleted) return false;
      if (activeFilter === "pending" && day.isDayCompleted) return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDayTitle = day.title.toLowerCase().includes(q);
        const matchesTasks = day.subTasks.some((t) => t.text.toLowerCase().includes(q));
        if (!matchesDayTitle && !matchesTasks) return false;
      }

      return true;
    });
  }, [challenge, selectedPhase, activeFilter, searchQuery]);

  if (loading) {
    return <DocumentScannerLoader message="Loading Roadmap Poster..." fullScreen={false} />;
  }

  if (error || !challenge) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-rose-400 mb-2">Roadmap Not Found</h2>
        <p className="text-xs text-zinc-400 mb-4">{error || "Could not retrieve roadmap details."}</p>
        <Link
          to="/challenge"
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Challenge Hub
        </Link>
      </div>
    );
  }

  const pct = challenge.progressPercent || 0;

  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 p-3 sm:p-5 lg:p-7 selection:bg-indigo-500/30 print:p-0 print:bg-white print:text-black">
      {/* Top Navigation & Action Controls (Hidden on Print) */}
      <div className="max-w-[1440px] mx-auto mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/challenge")}
            className="p-2 rounded-xl bg-[#12141C] border border-white/[0.08] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">All Challenges</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
              {challenge.completedTasks} / {challenge.totalTasks} Tasks
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {pct}% Done
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="bg-[#12141C] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
            />
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-[#12141C] border border-white/[0.08] text-zinc-400 hover:text-zinc-100 transition-colors text-xs flex items-center gap-1.5"
            title="Copy Link"
          >
            <Share2 size={14} />
            <span className="hidden md:inline">{copiedLink ? "Copied!" : "Share"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
            title="Print or Save as PDF Poster"
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          THE POSTER CONTAINER (EXACT HIGH-FIDELITY REPLICA OF THE IMAGE)
         ========================================================================= */}
      <div className="max-w-[1440px] mx-auto rounded-3xl bg-[#0B0D13] border-2 border-[#1E2333] shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6 relative overflow-hidden print:border-none print:shadow-none print:p-2">
        {/* Ambient background glows */}
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* -------------------------------------------------------------------
            1. POSTER HEADER BANNER
           ------------------------------------------------------------------- */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-b border-white/[0.08] pb-5">
          {/* Tagline Left */}
          <div className="text-center md:text-left">
            <span className="font-serif italic text-sm sm:text-base font-semibold tracking-wide text-amber-300 drop-shadow-[0_2px_10px_rgba(252,211,77,0.3)]">
              {challenge.tagline || "Learn • Build • Deploy"}
            </span>
            <div className="text-xs font-bold text-zinc-300 tracking-wider uppercase mt-0.5">
              Your Dream Career
            </div>
          </div>

          {/* Center Title & Subtitle */}
          <div className="text-center max-w-2xl px-2">
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="text-lg">🗓️</span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
                {challenge.title}
              </h1>
            </div>

            {challenge.subtitle && (
              <p className="text-xs sm:text-sm font-semibold text-amber-400 tracking-wide mt-0.5">
                {challenge.subtitle}
              </p>
            )}

            {/* Target Badge */}
            <div className="mt-2.5 inline-block">
              <span className="px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 border border-white/20">
                {challenge.badgeText || `${challenge.durationDays} Days • Focused Study • Real Projects`}
              </span>
            </div>
          </div>

          {/* Right Target / Goal Badge */}
          <div className="text-center md:text-right flex items-center md:flex-col gap-2 md:gap-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 p-[2px] shadow-lg shadow-rose-500/20 mx-auto">
              <div className="w-full h-full bg-[#0E1017] rounded-full flex items-center justify-center text-rose-400">
                <Target size={20} />
              </div>
            </div>
            <div>
              <p className="font-serif italic text-xs font-bold text-rose-300">
                {challenge.goalBadge || "Dream Big..."}
              </p>
              <p className="text-[11px] font-black tracking-tight text-zinc-100 uppercase">
                and Achieve It!
              </p>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------
            2. TRACKS / PHASE FLOW RIBBON (Arrows & Domain blocks)
           ------------------------------------------------------------------- */}
        {challenge.tracks && challenge.tracks.length > 0 && (
          <div className="py-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-start lg:justify-center gap-2 sm:gap-3 min-w-max px-2">
              {challenge.tracks.map((track, idx) => {
                const isSelected = selectedPhase === track.name;
                return (
                  <React.Fragment key={idx}>
                    <button
                      onClick={() =>
                        setSelectedPhase(isSelected ? "all" : track.name)
                      }
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                        isSelected
                          ? "bg-white/[0.14] border-white/40 text-white scale-105"
                          : "bg-[#11131C] border-white/[0.08] text-zinc-300 hover:border-white/[0.2] hover:bg-white/[0.06]"
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? `0 0 15px ${track.color || "#3B82F6"}40`
                          : "none"
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-black shadow-inner"
                        style={{ backgroundColor: track.color || "#3B82F6" }}
                      >
                        {track.badge || idx + 1}
                      </span>
                      <span className="font-bold">{track.name}</span>
                    </button>

                    {idx < challenge.tracks.length - 1 && (
                      <span className="text-zinc-600 font-bold text-sm select-none">
                        ❯
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Phase Filter Notice */}
        {selectedPhase !== "all" && (
          <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <span className="text-indigo-300">
              Showing only: <strong>{selectedPhase}</strong>
            </span>
            <button
              onClick={() => setSelectedPhase("all")}
              className="text-xs text-zinc-400 hover:text-white underline font-medium"
            >
              Show All Phases
            </button>
          </div>
        )}

        {/* -------------------------------------------------------------------
            3. DAY-WISE TASK CARDS GRID (5 COLUMNS LIKE IN THE IMAGE)
           ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {filteredDays.map((day) => {
            const isCompleted = day.isDayCompleted;
            const completedCount = day.subTasks.filter((t) => t.completed).length;
            const totalCount = day.subTasks.length;

            return (
              <div
                key={day.dayNumber}
                className={`group relative rounded-xl transition-all duration-200 border flex flex-col justify-between overflow-hidden shadow-md ${
                  isCompleted
                    ? "bg-[#0F1A17] border-emerald-500/40 shadow-emerald-500/10"
                    : "bg-[#10121A] hover:bg-[#131622] border-white/[0.09] hover:border-white/[0.2]"
                }`}
              >
                <div>
                  {/* Card Header Bar (Color accented based on phase) */}
                  <div
                    className="px-3 py-2 border-b flex items-center justify-between text-xs font-bold"
                    style={{
                      backgroundColor: `${day.phaseColor || "#3B82F6"}18`,
                      borderColor: `${day.phaseColor || "#3B82F6"}40`,
                      color: day.phaseColor || "#93C5FD"
                    }}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono uppercase text-[11px] font-black">
                        Day {day.dayNumber}
                      </span>
                      <span className="text-zinc-500 font-normal">•</span>
                      <span className="truncate text-zinc-200 font-bold text-[11.5px]" title={day.title}>
                        {day.title.replace(/^Day\s*\d+\s*[–-]\s*/i, "")}
                      </span>
                    </div>

                    {isCompleted && (
                      <span className="shrink-0 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                        DONE ✓
                      </span>
                    )}
                  </div>

                  {/* Sub-tasks Checklist */}
                  <div className="p-3 space-y-2">
                    {day.subTasks.map((task) => {
                      const taskId = task.id || task._id;
                      return (
                        <div
                          key={taskId}
                          onClick={() => handleToggleTask(day.dayNumber, taskId, task.completed)}
                          className={`flex items-start gap-2 cursor-pointer p-1 rounded-md transition-colors select-none ${
                            task.completed
                              ? "text-zinc-500 line-through bg-white/[0.01]"
                              : "text-zinc-200 hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          {/* Custom Checkbox (matches image checkmark) */}
                          <div
                            className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                              task.completed
                                ? "bg-emerald-500 text-black shadow-sm"
                                : "border border-white/30 bg-black/40 hover:border-indigo-400"
                            }`}
                          >
                            {task.completed && <Check size={11} strokeWidth={3.5} />}
                          </div>

                          <span className="text-[11.5px] leading-snug">
                            {task.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Day Card Footer Progress Mini Bar */}
                <div className="px-3 pb-2 pt-1 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="truncate max-w-[100px] text-zinc-400">
                    {day.phase}
                  </span>
                  <span className="font-mono">
                    {completedCount}/{totalCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* -------------------------------------------------------------------
            4. BOTTOM 4-BOX GRID WIDGETS (EXACTLY MATCHING THE IMAGE)
           ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/[0.08]">
          {/* Widget 1: Daily Schedule */}
          <div className="rounded-2xl bg-[#0D1017] border border-amber-500/25 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
              <Clock size={15} />
              <span>Daily Schedule</span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              {(challenge.dailySchedule || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 p-1.5 rounded-lg bg-black/30 border border-white/[0.04]"
                >
                  <span className="text-amber-400 font-bold shrink-0">
                    {item.timeSlot}
                  </span>
                  <span className="text-zinc-300 text-right">
                    {item.activity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Pro Tips */}
          <div className="rounded-2xl bg-[#0D1017] border border-emerald-500/25 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wide">
              <Lightbulb size={15} />
              <span>Pro Tips</span>
            </div>
            <ul className="space-y-2 text-[11.5px] text-zinc-300">
              {(challenge.proTips || []).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-400 shrink-0 font-bold">✔</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Widget 3: Recommended Tools */}
          <div className="rounded-2xl bg-[#0D1017] border border-cyan-500/25 p-4 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wide">
              <Wrench size={15} />
              <span>Recommended Tools</span>
            </div>
            <div className="space-y-2 text-[11.5px]">
              {(challenge.recommendedTools || []).map((tool, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold shrink-0">❖</span>
                  <div>
                    <span className="font-bold text-zinc-100">{tool.name}</span>
                    <span className="text-zinc-400"> – {tool.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 4: Your Goal */}
          <div className="rounded-2xl bg-[#0D1017] border border-purple-500/25 p-4 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wide">
              <Trophy size={15} />
              <span>Your Goal</span>
            </div>
            <ul className="space-y-2 text-[11.5px] text-zinc-300">
              {(challenge.goals || []).map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-purple-400 shrink-0 font-bold">✔</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* -------------------------------------------------------------------
            5. MOTIVATIONAL FOOTER BANNER (PERSONALIZED FOR MANOJ!)
           ------------------------------------------------------------------- */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/70 to-indigo-900/60 border border-indigo-400/30 p-3 sm:p-4 text-center shadow-lg shadow-indigo-500/10">
          <p className="text-xs sm:text-sm md:text-base font-black tracking-wide text-amber-300 flex items-center justify-center gap-2">
            <span>⭐</span>
            <span>{challenge.motivationalQuote}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  Plus,
  Sparkles,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  Layers,
  Flame,
  Search,
  BookOpen
} from "lucide-react";
import {
  getChallenges,
  deleteChallenge,
  seedDemoRoadmap
} from "../services/challengeService";
import { CreateChallengeModal } from "../components/challenge/CreateChallengeModal";
import { DocumentScannerLoader } from "../components/common/DocumentScannerLoader";

export const ChallengeHubPage = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await getChallenges();
      if (data?.success) {
        setChallenges(data.challenges || []);
      }
    } catch (err) {
      console.error("Failed to load challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this study challenge?")) return;

    try {
      await deleteChallenge(id);
      setChallenges((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete challenge error:", err);
    }
  };

  const handleSeedTemplate = async () => {
    try {
      setSeeding(true);
      const res = await seedDemoRoadmap();
      if (res?.success && res.roadmap) {
        navigate(`/challenge/${res.roadmap._id}`);
      }
    } catch (err) {
      console.error("Seed roadmap error:", err);
    } finally {
      setSeeding(false);
    }
  };

  // Metrics
  const totalChallenges = challenges.length;
  const completedTasks = challenges.reduce((sum, c) => sum + (c.completedTasks || 0), 0);
  const totalTasks = challenges.reduce((sum, c) => sum + (c.totalTasks || 0), 0);
  const completedChallenges = challenges.filter((c) => c.status === "completed").length;

  const filtered = challenges.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <DocumentScannerLoader message="Loading Study Challenges & Roadmaps..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen bg-[#08090C] text-zinc-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#12141D] via-[#0E1017] to-[#161226] border border-white/[0.1] shadow-2xl overflow-hidden">
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <CalendarCheck size={14} />
              <span>30-Day & Custom Study Roadmaps</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Study Challenge & Roadmap Hub
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Transform any syllabus, text, or PDF into an interactive day-by-day developer roadmap with checkable sub-tasks, daily study schedules, pro tips, and goals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedTemplate}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.14] text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all hover:border-indigo-400/50"
            >
              <Layers size={15} className="text-indigo-400" />
              <span>{seeding ? "Loading..." : "Load 30-Day Template"}</span>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus size={16} />
              <span>Create New Challenge</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/[0.08]">
          <div className="bg-black/30 rounded-2xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Active Roadmaps</span>
              <BookOpen size={14} className="text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white">{totalChallenges}</p>
          </div>

          <div className="bg-black/30 rounded-2xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Completed Tasks</span>
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">
              {completedTasks} <span className="text-xs text-zinc-500 font-normal">/ {totalTasks}</span>
            </p>
          </div>

          <div className="bg-black/30 rounded-2xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Completed Challenges</span>
              <Trophy size={14} className="text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">{completedChallenges}</p>
          </div>

          <div className="bg-black/30 rounded-2xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Streak & Consistency</span>
              <Flame size={14} className="text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-400">
              Active <span className="text-xs text-zinc-500 font-normal">🔥</span>
            </p>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges or tech stack..."
            className="w-full bg-[#10121A] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-zinc-400 self-end sm:self-auto">
          Showing {filtered.length} of {challenges.length} roadmap{challenges.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Challenge Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-[#0E1017] border border-white/[0.06] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
            <Sparkles size={28} />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-zinc-100">No Roadmaps Found</h3>
            <p className="text-xs text-zinc-400">
              Create your first study challenge using AI, or click below to load the complete 30-Day Developer Roadmap from your image!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedTemplate}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-zinc-200 border border-white/[0.12] transition-colors"
            >
              Load 30-Day Template
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Create New Roadmap
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const pct = item.progressPercent || 0;
            return (
              <div
                key={item._id}
                onClick={() => navigate(`/challenge/${item._id}`)}
                className="group relative rounded-2xl bg-[#0E1017] hover:bg-[#12141F] border border-white/[0.08] hover:border-indigo-500/40 p-5 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between overflow-hidden"
              >
                {/* Top color bar indicator */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"
                />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {item.durationDays} Days Challenge
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, item._id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-1 rounded-md transition-opacity"
                      title="Delete Challenge"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {item.subtitle}
                    </p>
                  )}

                  {/* Tracks pills */}
                  {item.tracks && item.tracks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.tracks.slice(0, 3).map((tr, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                        >
                          {tr.name}
                        </span>
                      ))}
                      {item.tracks.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-zinc-500">
                          +{item.tracks.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Progress</span>
                    <span className="font-mono font-bold text-zinc-200">
                      {item.completedTasks || 0} / {item.totalTasks || 0} Tasks ({pct}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {item.dailyHours || 4}h / day
                    </span>
                    <span className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Open Roadmap <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <CreateChallengeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(newRoadmap) => {
          setChallenges((prev) => [newRoadmap, ...prev]);
          navigate(`/challenge/${newRoadmap._id}`);
        }}
      />
    </div>
  );
};

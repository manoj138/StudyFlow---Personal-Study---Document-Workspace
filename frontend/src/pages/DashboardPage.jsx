import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import API from "../services/api";
import {
  BookOpen, Clock, Bookmark, FileText, ArrowRight, Plus, FolderPlus,
  Sparkles, Activity, Upload, Flame, Target, TrendingUp, ChevronRight, BarChart2, CheckCircle2,
  Code, Brain, Microscope, Calculator, Check, Search, Bell, MoreVertical, Layers, Zap, Sun, Moon, Youtube, GraduationCap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StatCard } from "../components/ui/StatCard";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import { DocumentCard } from "../components/common/DocumentCard";
import { VideoCard } from "../components/common/VideoCard";

export const DashboardPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [highlightsCount, setHighlightsCount] = useState(0);
  const [continueDoc, setContinueDoc] = useState(null);
  const [totalReadingSeconds, setTotalReadingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State for Add Subject
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState("#6366F1");
  const [newSubjectIcon, setNewSubjectIcon] = useState("BookOpen");
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [subjRes, docRes] = await Promise.all([
        API.get("/subjects"),
        API.get("/documents")
      ]);

      if (subjRes.data.success) {
        setSubjects(subjRes.data.data);
      }

      if (docRes.data.success) {
        const docs = docRes.data.data;
        setDocuments(docs);

        if (docs.length > 0) {
          const withProgress = docs.filter((d) => d.progress && d.progress.completionPercentage > 0);
          setContinueDoc(withProgress.length > 0 ? withProgress[0] : docs[0]);

          const totalSecs = docs.reduce((acc, curr) => acc + (curr.progress?.timeSpentSeconds || 0), 0);
          setTotalReadingSeconds(totalSecs);
        }
      }

      try {
        const [bRes, hRes] = await Promise.all([
          API.get("/annotations/bookmarks"),
          API.get("/annotations/highlights")
        ]);
        if (bRes.data?.success) setBookmarksCount(bRes.data.data.length);
        if (hRes.data?.success) setHighlightsCount(hRes.data.data.length);
      } catch (e) {
        // Fallback
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      const res = await API.post("/subjects", {
        name: newSubjectName,
        description: newSubjectDesc,
        color: newSubjectColor,
        icon: newSubjectIcon
      });
      if (res.data.success) {
        setSubjects([res.data.data, ...subjects]);
        setNewSubjectName("");
        setNewSubjectDesc("");
        setNewSubjectColor("#6366F1");
        setNewSubjectIcon("BookOpen");
        setShowSubjectModal(false);
      }
    } catch (err) {
      console.error("Failed to create subject:", err);
    }
  };

  const colorPresets = [
    { name: "Indigo", hex: "#6366F1" },
    { name: "Emerald", hex: "#10B981" },
    { name: "Violet", hex: "#8B5CF6" },
    { name: "Amber", hex: "#F59E0B" },
    { name: "Rose", hex: "#F43F5E" },
    { name: "Cyan", hex: "#06B6D4" }
  ];

  const iconOptions = [
    { id: "BookOpen", label: "General", Icon: BookOpen },
    { id: "Code", label: "Coding", Icon: Code },
    { id: "Brain", label: "Theory", Icon: Brain },
    { id: "Microscope", label: "Science", Icon: Microscope },
    { id: "Calculator", label: "Math", Icon: Calculator }
  ];

  // Dynamic Reading Time Formatter
  const formatReadingTime = (totalSecs) => {
    if (!totalSecs || totalSecs === 0) return "0m";
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Time of day greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Format date like "Tue, 21 Sep 2026"
  const formattedToday = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  // Calculate 7-day Upload Trend
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newDocsThisWeek = documents.filter((d) => new Date(d.createdAt) >= sevenDaysAgo).length;

  // Calculate Dynamic Average Completion & Focus Level
  const avgCompletion = documents.length > 0
    ? Math.round(documents.reduce((acc, curr) => acc + (curr.progress?.completionPercentage || 0), 0) / documents.length)
    : 0;

  const getFocusTier = (pct) => {
    if (pct >= 75) return { label: "Peak Focus", note: "You're on fire! 🔥", stroke: "92, 100" };
    if (pct >= 40) return { label: "Steady Progress", note: "Great momentum! ⚡", stroke: "60, 100" };
    if (pct > 0) return { label: "Getting Started", note: "Keep going! 🚀", stroke: "30, 100" };
    return { label: "Ready to Learn", note: "Upload first doc! 📖", stroke: "0, 100" };
  };

  const focusTier = getFocusTier(avgCompletion);

  // Dynamic Weekly Activity Breakdown (Grouped by Day of Week)
  const calculateWeeklyActivity = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daySecs = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    documents.forEach((doc) => {
      if (doc.progress?.timeSpentSeconds) {
        const updateDate = new Date(doc.updatedAt || doc.createdAt);
        const dayName = days[updateDate.getDay()];
        daySecs[dayName] += doc.progress.timeSpentSeconds;
      }
    });

    const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const maxSecs = Math.max(...Object.values(daySecs), 1);

    return orderedDays.map((day) => {
      const secs = daySecs[day] || 0;
      const hours = (secs / 3600).toFixed(1);
      const height = Math.max(12, Math.round((secs / maxSecs) * 100));
      return { day, hours: secs > 0 ? `${hours}h` : "0h", height };
    });
  };

  const dynamicWeekDays = calculateWeeklyActivity();

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-7 max-w-[1500px] mx-auto font-sans transition-colors duration-200">
      
      {/* Top Banner & Header CTA Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Main Sunset Artwork Hero Banner */}
        <div 
          className="flex-1 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg relative min-h-[220px] p-6 sm:p-8 flex flex-col justify-between bg-cover bg-center dark-panel"
          style={{ backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.45) 60%, rgba(15, 23, 42, 0.2) 100%), url('/hero_banner.jpg')` }}
        >
          {/* Date Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                <GraduationCap className="w-3.5 h-3.5 text-amber-300" /> Workspace Active
              </span>
            </div>
            <div className="text-xs font-semibold text-white/80 font-mono bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              <span>📅</span> {formattedToday}
            </div>
          </div>

          {/* Hero Main Content */}
          <div className="space-y-2 mt-4 relative z-10">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              {getTimeGreeting()}, 👋{" "}
              <span className="text-white">
                {user?.name || "Manoj Chougule"}
              </span>
            </h1>

            <p className="text-white/90 text-xs sm:text-sm max-w-xl leading-relaxed drop-shadow">
              Keep going! Every chapter you complete brings you closer to your dreams. You got this! 🚀
            </p>
          </div>

          {/* Better Than Yesterday Slogan Badge */}
          <div className="absolute right-6 bottom-6 hidden sm:block">
            <span className="water-brush-regular text-2xl text-amber-200 drop-shadow select-none">
              Better Than Yesterday ✨
            </span>
          </div>
        </div>

        {/* Primary Header CTA Buttons Stack */}
        <div className="flex flex-row sm:flex-col items-center justify-center gap-3 shrink-0 lg:w-48 w-full sm:w-auto">
          <button
            onClick={() => setShowSubjectModal(true)}
            className="w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <GraduationCap className="w-4 h-4 text-amber-300" />
            <span> Add Subject</span>
          </button>

          <button
            onClick={() => navigate("/library")}
            className="w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/15 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic Quantitative Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Total Documents */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              +{newDocsThisWeek} this week
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Documents</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {documents.length}
            </h3>
          </div>
          {/* Mini Sparkline Background Graph */}
          <svg className="absolute bottom-0 right-0 w-32 h-16 opacity-30 text-purple-500 pointer-events-none" viewBox="0 0 100 40">
            <path d="M0,35 Q25,10 50,25 T100,5 L100,40 L0,40 Z" fill="currentColor" opacity="0.2" />
            <path d="M0,35 Q25,10 50,25 T100,5" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        {/* Metric 2: Study Time */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ⚡ Active Time
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Study Time</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {formatReadingTime(totalReadingSeconds)}
            </h3>
          </div>
          {/* Mini Sparkline Background Graph */}
          <svg className="absolute bottom-0 right-0 w-32 h-16 opacity-30 text-emerald-500 pointer-events-none" viewBox="0 0 100 40">
            <path d="M0,30 Q30,35 60,15 T100,8 L100,40 L0,40 Z" fill="currentColor" opacity="0.2" />
            <path d="M0,30 Q30,35 60,15 T100,8" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        {/* Metric 3: Saved Annotations */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              📌 {bookmarksCount} Bookmarks
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saved Annotations</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {bookmarksCount + highlightsCount}
            </h3>
          </div>
          {/* Mini Sparkline Background Graph */}
          <svg className="absolute bottom-0 right-0 w-32 h-16 opacity-30 text-amber-500 pointer-events-none" viewBox="0 0 100 40">
            <path d="M0,25 Q20,35 50,15 T100,10 L100,40 L0,40 Z" fill="currentColor" opacity="0.2" />
            <path d="M0,25 Q20,35 50,15 T100,10" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        {/* Metric 4: Focus Level with Dynamic Gauge */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex items-center justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completion Rate</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{focusTier.label}</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
              {focusTier.note}
            </span>
          </div>

          {/* Radial Circular Progress Gauge */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#cyan-gradient)"
                strokeWidth="3.5"
                strokeDasharray={`${avgCompletion}, 100`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-xs font-extrabold text-slate-900 dark:text-white font-mono">
              {avgCompletion}%
            </span>
          </div>
        </div>

      </div>

      {/* 3-Column Lower Section: Weekly Activity | Recent Documents | Goals & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Col 1: Dynamic Weekly Activity Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Weekly Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live reading time per day</p>
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              This Week
            </span>
          </div>

          {/* Bar Columns Container */}
          <div className="flex items-end justify-between gap-3 pt-6 h-48">
            {dynamicWeekDays.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {w.hours}
                </span>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden h-36 flex flex-col justify-end p-1 border border-slate-200 dark:border-white/5">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-lg transition-all duration-300 group-hover:brightness-125"
                    style={{ height: `${w.height}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{w.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Recent Documents List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Recent Documents
            </h3>
            <Link to="/library" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
              <span>View All ({documents.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-200 dark:border-white/10 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">No documents uploaded yet.</p>
                <button
                  onClick={() => navigate("/library")}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Upload First Document
                </button>
              </div>
            ) : (
              documents.slice(0, 4).map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => navigate(`/document/${doc._id}`)}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: doc.subjectId?.color || "#6366F1" }}
                    >
                      {doc.fileType === "youtube" ? <Youtube size={18} /> : <FileText size={18} />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {doc.subjectId?.name || "General"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • {doc.progress?.completionPercentage || 0}% read
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 3: Focus on Your Goals Card + Quick Links (3 cols) */}
        <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
          
          {/* Goal Mountain Banner Card */}
          <div 
            className="rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm text-white flex flex-col justify-between relative overflow-hidden bg-cover bg-center min-h-[160px] dark-panel"
            style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%), url('/hero_banner.jpg')` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">Focus on Your Goals</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed my-2">
              Consistent effort today builds your success tomorrow.
            </p>

            <button
              onClick={() => navigate("/library")}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Keep Going</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Links Card */}
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick Links
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => navigate("/library")}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white flex items-center gap-2 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Notes</span>
              </button>

              <button 
                onClick={() => navigate("/revision")}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white flex items-center gap-2 transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                <span>Revisions</span>
              </button>

              <button 
                onClick={() => navigate("/library")}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white flex items-center gap-2 transition-all"
              >
                <Code className="w-3.5 h-3.5 text-emerald-500" />
                <span>Practice DSA</span>
              </button>

              <button 
                onClick={() => navigate("/dashboard")}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white flex items-center gap-2 transition-all"
              >
                <Brain className="w-3.5 h-3.5 text-cyan-500" />
                <span>Progress</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Add Subject Modal */}
      <Modal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        title="Add New Subject"
        icon={FolderPlus}
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Subject Name</label>
            <input
              type="text"
              required
              placeholder="e.g. System Design, Computer Networks"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="w-full bg-[#0F172A] border border-dark-border/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Advanced distributed systems architecture"
              value={newSubjectDesc}
              onChange={(e) => setNewSubjectDesc(e.target.value)}
              className="w-full bg-[#0F172A] border border-dark-border/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Color Theme</label>
            <div className="flex items-center gap-3">
              {colorPresets.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setNewSubjectColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    newSubjectColor === c.hex ? "scale-125 ring-2 ring-white" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowSubjectModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Save Subject
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default DashboardPage;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, ArrowRight, Zap, Bookmark, Layers, CheckCircle2, ShieldCheck, Flame, BookOpen, 
  Youtube, Play, Code, Brain, Clock, HelpCircle, RotateCw, FileText, Check, Star, Video, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("youtube");
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 transition-colors duration-200 bg-slate-50 dark:bg-[#070B14]">
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-semibold shadow-sm backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" /> Next-Gen Personal Study & Document Workspace
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.12]"
          >
            Upload PDFs. Watch Videos.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 dark:from-indigo-400 dark:via-purple-400 dark:to-amber-300">
              Master Faster with AI.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 dark:text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Stop losing your reading progress across scattered notes and videos. StudyFlow combines Notion-style document reflow, YouTube AI study notes, chapter timelines, and 3D flashcards in one unified workspace.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer text-base"
            >
              Start Free Workspace <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold border border-slate-300 dark:border-slate-700/80 shadow-sm transition-all hover:scale-105 cursor-pointer text-base backdrop-blur-md"
            >
              Sign In to Your Workspace
            </Link>
          </motion.div>

          {/* Executive Workspace Preview Card Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-8 max-w-5xl mx-auto"
          >
            <div className="rounded-3xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-[#0B1120] p-2 sm:p-4 shadow-xl dark:shadow-2xl dark:shadow-indigo-950/50 overflow-hidden relative group backdrop-blur-md">
              <div className="rounded-2xl overflow-hidden relative border border-slate-200 dark:border-dark-border">
                <img 
                  src="/hero_banner.jpg" 
                  alt="StudyFlow Dashboard Workspace Preview"
                  className="w-full h-[280px] sm:h-[400px] object-cover object-center group-hover:scale-105 transition-transform duration-700" 
                />
                
                {/* Top Left Floating Artistic Quote Badge */}
                <div className="absolute top-4 sm:top-6 left-5 sm:left-8 z-20 pointer-events-none">
                  <span className="water-brush-regular text-3xl sm:text-5xl md:text-6xl text-amber-200 drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] tracking-wide select-none">
                    Better Than Yesterday.
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex items-end p-6 text-left dark-panel">
                  <div className="space-y-1 text-white max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-600 text-white border border-indigo-400/30 uppercase tracking-wider">
                        STUDYFLOW v2.0 WORKSPACE
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ⚡ AI Powered
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">Interactive Reading & Video Learning Engine</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Auto-save reading markers, extract Notion-style code blocks, watch YouTube courses with timestamped AI chapters, and flip active recall revision flashcards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* 2. Interactive Product Feature Demonstration Playground */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 dark:border-dark-border/60">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Interactive Feature Tour
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Everything You Need for Deep Learning</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Click through our core workspace engines below to see how StudyFlow streamlines your study workflow.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setActiveTab("youtube")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeTab === "youtube"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/25"
                : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-border hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Youtube size={16} />
            <span>🎬 YouTube AI Video Notes</span>
          </button>

          <button
            onClick={() => setActiveTab("reflow")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeTab === "reflow"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/25"
                : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-border hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers size={16} />
            <span>📄 Editorial Doc Reflow</span>
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeTab === "flashcards"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25"
                : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-border hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <HelpCircle size={16} />
            <span>🎴 3D Revision Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeTab === "analytics"
                ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/25"
                : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-border hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Clock size={16} />
            <span>⏱️ Reading Progress & Analytics</span>
          </button>
        </div>

        {/* Tab Content Display Panels */}
        <div className="bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-dark-border rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden">
          {activeTab === "youtube" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold">
                  <Sparkles size={14} className="text-amber-500 dark:text-amber-400" /> Powered by Google Gemini AI
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Instant YouTube Course Notes & Timestamps</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  Paste any YouTube course or video link. StudyFlow automatically embeds the video player and generates structured AI summaries, timestamped chapter timelines, key takeaways, and flashcards.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Auto-generates 00:00 timestamp chapter navigation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Executive bullet takeaways for high-yield exam prep</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Embedded distraction-free YouTube video player</span>
                  </div>
                </div>
              </div>

              {/* Mockup Showcase Card */}
              <div className="bg-slate-900 dark:bg-[#070B14] border border-red-500/30 rounded-2xl p-5 space-y-4 shadow-xl text-white">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" alt="Video thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                      <Play size={20} className="ml-1 fill-current" />
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Gemini AI Executive Summary</span>
                  <p className="text-xs text-slate-200">Exhaustive breakdown of core architecture, reactive state hooks, and component lifecycle.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "reflow" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                  <Layers size={14} /> 100% Loss-Free Document Parser
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Notion & Linear Style Study Reflow</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  Transform dense PDF documents and DOCX files into beautiful, distraction-free technical documentation with syntax-highlighted code blocks and interactive demo buttons.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Preserves 100% of text without losing a single word</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Interactive code blocks with copy-to-clipboard & execution</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Multi-language badges (🇬🇧 English & 🇮🇳 Marathi notes)</span>
                  </div>
                </div>
              </div>

              {/* Code Playground Preview */}
              <div className="bg-slate-900 dark:bg-[#070B14] border border-indigo-500/30 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl text-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 dark:border-dark-border text-indigo-300">
                  <span>javascript_demo.js</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">COPY CODE</span>
                </div>
                <pre className="text-slate-300 leading-relaxed">
                  <span className="text-purple-400">const</span> studyFlow = <span className="text-amber-300">new</span> <span className="text-indigo-400">Workspace</span>();{"\n"}
                  studyFlow.<span className="text-emerald-400">autoSaveProgress</span>();{"\n"}
                  console.<span className="text-blue-400">log</span>(<span className="text-emerald-300">"Master topics faster!"</span>);
                </pre>
              </div>
            </motion.div>
          )}

          {activeTab === "flashcards" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  <Brain size={14} /> Active Recall Learning
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">3D Interactive Revision Flashcards</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  Retain concepts effortlessly with automated 3D flip flashcards. Self-assess your recall using Hard, Good, and Easy rating controls.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Interactive 3D perspective card flip on click</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Self-assessment rating buttons (🔴 Hard, 🟡 Good, 🟢 Easy)</span>
                  </div>
                </div>
              </div>

              {/* Interactive Demo Flashcard */}
              <div
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="relative h-60 w-full rounded-2xl bg-slate-900 dark:bg-[#070B14] border border-emerald-500/40 p-6 flex flex-col justify-between cursor-pointer transition-transform hover:scale-102 shadow-xl text-white"
              >
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span className="font-bold">Card #1 (Click to Flip)</span>
                  <RotateCw size={14} />
                </div>
                <div className="text-center my-auto">
                  <p className="text-base font-bold text-white">
                    {flashcardFlipped
                      ? "A: State management encapsulates mutable component data, while props are read-only properties passed down."
                      : "Q: What is the primary difference between props and state in React?"}
                  </p>
                </div>
                <div className="text-center text-xs text-slate-400">
                  {flashcardFlipped ? "Recall Verified!" : "Tap card to reveal answer"}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold">
                  <Clock size={14} /> Silent Position Syncing
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Debounced Auto-Save & Reading Analytics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  Never lose your place again. StudyFlow automatically records your exact scroll position, total time spent, and reading streak.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Debounced 1-second background position saving</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Reading completion percentages & study duration counters</span>
                  </div>
                </div>
              </div>

              {/* Analytics Metric Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 dark:bg-[#070B14] border border-purple-500/30 rounded-2xl text-center space-y-1 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reading Progress</span>
                  <h4 className="text-3xl font-extrabold text-white">88%</h4>
                  <p className="text-xs text-purple-400 dark:text-purple-300 font-semibold">Auto-Synced</p>
                </div>
                <div className="p-4 bg-slate-900 dark:bg-[#070B14] border border-amber-500/30 rounded-2xl text-center space-y-1 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Study Streak</span>
                  <h4 className="text-3xl font-extrabold text-amber-400">🔥 7 Days</h4>
                  <p className="text-xs text-amber-400 dark:text-amber-300 font-semibold">Active Streak</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 3. Executive 6-Feature Grid Showcase */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 dark:border-dark-border/60">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Platform Capability
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Built for High-Performance Learners</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Debounced Progress Auto-Save</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              StudyFlow silently syncs your exact scroll position and reading progress so you can resume on any device instantly.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Original & Reflow Reader Mode</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Read original PDF page views or switch to Study Reflow mode optimized for mobile, tablet, and widescreen displays.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Smart Revision Hub</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Access all your bookmarks, text highlights, and contextual personal study notes in one centralized revision feed.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm hover:border-red-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
              <Youtube className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">YouTube Video AI Importer</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Convert YouTube courses into timestamped chapters, summaries, and flashcards via Google Gemini 3.5 AI.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3D Active Recall Flashcards</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Self-test your topic retention with 3D interactive flip cards and Hard/Good/Easy recall evaluation.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-600 dark:text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Color-Coded Subject Workspaces</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Organize your documents and video notes by subject with custom color palettes, icons, and instant category filters.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Footer & Platform Metrics */}
      <footer className="border-t border-slate-200 dark:border-dark-border/60 py-10 text-center text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#04070F]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              SF
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">StudyFlow Workspace</span>
          </div>

          <p className="text-slate-500 dark:text-slate-400">
            © 2026 StudyFlow Workspace. Built for focused modern learners.
          </p>

          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
            <Link to="/login" className="hover:text-indigo-600 dark:hover:text-white transition-colors font-medium">Sign In</Link>
            <span>•</span>
            <Link to="/register" className="hover:text-indigo-600 dark:hover:text-white transition-colors font-medium">Create Free Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

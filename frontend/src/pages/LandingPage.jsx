import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  ArrowRight,
  Code,
  Brain,
  CheckCircle2,
  Terminal,
  Layers,
  RotateCcw,
  BookOpen,
  Mic,
  Copy,
  Check,
  Zap,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Kbd
} from "../components/ui";

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const sampleQuestion = {
    category: "JAVASCRIPT RUNTIME",
    title: "Explain the difference between Microtasks and Macrotasks in the Node.js Event Loop.",
    code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
process.nextTick(() => console.log('4'));
console.log('5');
// Expected Output: 1, 5, 4, 3, 2`,
    explanation:
      "Microtasks (process.nextTick, Promise callbacks) run immediately after the current operation finishes and before the event loop advances to the next phase (Timers, Poll, Check).",
    keywords: ["process.nextTick", "Microtask Queue", "Call Stack", "Macrotask (Timers)"]
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleQuestion.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070709] bg-luxury-mesh text-zinc-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-white font-sans antialiased">
      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* Top Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                STUDYFLOW // THE MERN INTERVIEW COCKPIT
              </span>
            </div>
          </motion.div>

          {/* Main Hero Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
              Master Senior Technical Interviews.{" "}
              <span className="text-zinc-400">
                Not Just Passive Notes.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
              StudyFlow combines 250 high-yield production questions, Anki active recall spaced repetition, audio pronunciation, and distraction-free document reflow in one precision developer workspace.
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate(user ? "/dashboard" : "/register")}
              className="w-full sm:w-auto h-11 px-6 text-sm"
            >
              {user ? "Open Dev Dashboard" : "Launch Workspace Free"}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              icon={Brain}
              onClick={() => navigate(user ? "/interview" : "/login")}
              className="w-full sm:w-auto h-11 px-6 text-sm"
            >
              Explore 250 MERN Curriculum
            </Button>
          </motion.div>

          {/* Interactive Hero Showcase Terminal (MacOS / Warp Style) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-10 max-w-4xl mx-auto text-left"
          >
            <div className="rounded-lg border border-white/[0.1] bg-[#0c0d14] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#11121c] border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] opacity-80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] opacity-80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] opacity-80" />
                  <span className="ml-2 text-[11px] font-mono text-zinc-400 font-medium">
                    studyflow-drill ~ node-event-loop.ts
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="sm">Active Recall Drill</Badge>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="warning" size="sm">{sampleQuestion.category}</Badge>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                    <span>Press</span>
                    <Kbd>Space</Kbd>
                    <span>to reveal benchmark answer</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-zinc-100 leading-snug">
                  {sampleQuestion.title}
                </h3>

                <pre className="p-3.5 rounded-md bg-[#070709] border border-white/[0.06] text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                  <code>{sampleQuestion.code}</code>
                </pre>

                {/* Model Answer Preview Box */}
                <div className="p-4 rounded-md bg-white/[0.02] border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                      <Sparkles size={13} className="text-indigo-400" />
                      <span>Benchmark Interview Answer</span>
                    </span>
                    <span className="text-emerald-400 font-semibold">Senior Interview Standard</span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                    {sampleQuestion.explanation}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sampleQuestion.keywords.map((kw, i) => (
                      <Badge key={i} variant="accent" size="sm">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Spaced Repetition Keyboard Pill */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <Kbd>1</Kbd> <span className="text-rose-400 font-semibold">Again</span> (Tomorrow)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Kbd>2</Kbd> <span className="text-amber-400 font-semibold">Good</span> (3 Days)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Kbd>3</Kbd> <span className="text-emerald-400 font-semibold">Mastered</span> (7 Days)
                    </span>
                  </div>

                  <span className="text-zinc-500 hidden sm:inline">Self-Study Mode Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. 4 Quantitative Capabilities Grid */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <Badge variant="accent">Production Architecture</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Engineered for MERN Engineers Target Placement
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Everything you need to transform 11 months of production experience into fluent, high-conviction senior interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 space-y-3">
            <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
              <Brain size={16} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
              250 High-Yield Questions
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Complete curriculum spanning JavaScript Event Loop, React 19 Hooks, Node Clusters, and MongoDB Aggregation Pipelines.
            </p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
              <RotateCcw size={16} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
              Anki Spaced Repetition
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Dynamic algorithm calculates recall decay. Reviews questions at the exact moment before you forget to build permanent memory.
            </p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
              <Mic size={16} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
              Calm Self-Study + Voice
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Keyboard-first silent reading without sensory overload. Toggle candidate voice recording when you want verbal fluency practice.
            </p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
              <BookOpen size={16} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
              Bilingual Concept Logic
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Voluntary Marathi concept drawers break down intricate distributed systems and concurrency logic into intuitive intuition.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. Curriculum Matrix Section */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="accent" size="sm">Dec 2026 Ready</Badge>
                <span className="text-xs font-mono text-zinc-400">Full Curriculum Breakdown</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100 tracking-tight">
                MERN Production Architecture Syllabus
              </h3>
            </div>

            <Button
              variant="indigo"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate(user ? "/interview" : "/register")}
            >
              Start Free Practice
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-md bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">JavaScript Runtime</span>
                <Badge variant="neutral" size="sm">60 Qs</Badge>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Closures, Prototype chain, Event Loop, Promises, Garbage Collection.
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">React & Architecture</span>
                <Badge variant="neutral" size="sm">55 Qs</Badge>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Fiber reconciler, Hooks internals, Server Actions, Zustand, Performance.
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">Node.js & Backend</span>
                <Badge variant="neutral" size="sm">50 Qs</Badge>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Streams, Clustering, JWT auth, Middleware pipelines, Rate limiting.
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">MongoDB & Indexing</span>
                <Badge variant="neutral" size="sm">45 Qs</Badge>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Aggregation framework, Index optimization, Transactions, Sharding.
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">Internship Scenarios</span>
                <Badge variant="neutral" size="sm">40 Qs</Badge>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                11-month production incident handling, bug fixes, deployment reviews.
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">System Design Basics</span>
                <Badge variant="neutral" size="sm">25 Qs</Badge>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Caching (Redis), Load balancing, CDN, DB replication basics.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* 4. Luxury Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
            <span className="text-zinc-400 font-semibold">StudyFlow Workspace</span>
            <span>•</span>
            <span>Linear Developer Standard</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <Link to="/interview" className="hover:text-white transition-colors">Interview Hub</Link>
            <Link to="/library" className="hover:text-white transition-colors">Library</Link>
            <Link to="/revision" className="hover:text-white transition-colors">Revision Deck</Link>
          </div>

          <div>© 2026 StudyFlow • Built for Manoj Chougule</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

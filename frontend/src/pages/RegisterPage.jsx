import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, UserPlus, User, Mail, Lock, AlertCircle, Sparkles, CheckCircle2, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-purple-500/30 transition-colors duration-200">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10"
      >
        {/* Left Side: Artwork Showcase Banner */}
        <div 
          className="hidden md:flex flex-col justify-between p-8 text-white relative overflow-hidden bg-cover bg-center dark-panel"
          style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%), url('/hero_banner.jpg')` }}
        >
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="StudyFlow Logo" className="w-8 h-8 object-contain drop-shadow-md" />
            <span className="font-extrabold text-lg tracking-tight text-white">Study<span className="text-purple-400">Flow</span></span>
          </div>

          <div className="space-y-4 my-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-purple-300 text-xs font-semibold border border-white/20">
              <GraduationCap className="w-3.5 h-3.5 text-purple-300" /> Start Free Workspace
            </span>
            <h2 className="text-2xl font-extrabold text-white leading-snug">
              Create Your Personal Study Workspace
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Join StudyFlow to organize all your course materials, PDF notes, and revision highlights in one place.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited document uploads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom subject module categories</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated revision hub feed</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">© 2026 StudyFlow Personal Workspace</p>
        </div>

        {/* Right Side: Register Form */}
        <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <img src="/logo.png" alt="StudyFlow Logo" className="w-8 h-8 object-contain md:hidden" />
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Workspace</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sign up in seconds to start reading and organizing notes.</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Manoj Chougule"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Free Workspace
                </>
              )}
            </button>
          </form>

          <p className="text-center md:text-left text-xs text-slate-500 dark:text-slate-400 pt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Input, Button, Badge } from "../components/ui";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setError("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSubmitting(false);
      return;
    }

    try {
      await register(trimmedName, trimmedEmail, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl rounded-lg border border-white/[0.08] bg-[#0E1015] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_16px_36px_-8px_rgba(0,0,0,0.85)] overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* Left Side: Developer Workspace Showcase */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-[#08090C] border-r border-white/[0.08] text-zinc-100">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="StudyFlow Logo"
              className="w-7 h-7 object-contain"
            />
            <span className="font-bold text-base tracking-tight">
              Study<span className="text-zinc-400">Flow</span>
            </span>
          </div>

          <div className="space-y-4 my-auto">
            <Badge variant="accent" size="sm">
              Free Developer Workspace
            </Badge>

            <h2 className="text-xl font-bold tracking-tight text-zinc-100 leading-snug">
              Build your technical interview foundation
            </h2>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Create your account to organize documentation, study modules, and practice daily interview sprints.
            </p>

            <div className="space-y-2 pt-2 text-xs text-zinc-300 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Unlimited technical document uploads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Structured subject tracks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Daily active recall revision queue</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 font-mono">
            StudyFlow • Production Standard 2026
          </p>
        </div>

        {/* Right Side: Register Form */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
              Create Account
            </h2>
            <p className="text-xs text-zinc-400">
              Start your personal study and document workspace
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              icon={User}
              placeholder="Manoj Chougule"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              required
              icon={Mail}
              placeholder="developer@studyflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              required
              icon={Lock}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="indigo"
              size="md"
              loading={submitting}
              className="w-full mt-2"
            >
              Create Workspace Account
            </Button>
          </form>

          <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-medium text-zinc-200 hover:text-white hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

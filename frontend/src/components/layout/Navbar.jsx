import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { BookOpen, LogOut, User, Sun, Moon, Search, Menu, X, ChevronRight } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-[#080C14]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-colors duration-200">
      {/* Brand Logo & Tag */}
      <Link
        to={user ? "/dashboard" : "/"}
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-2 group shrink-0"
      >
        <img
          src="/logo.png"
          alt="StudyFlow Logo"
          className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
        />
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white font-sans">
            Study<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60">
            Workspace
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      {user && (
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-white/5">
          <Link
            to="/dashboard"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive("/dashboard")
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/library"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive("/library") || location.pathname.startsWith("/document")
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            Library
          </Link>
          <Link
            to="/revision"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive("/revision")
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            Revision
          </Link>
        </nav>
      )}

      {/* Desktop Right Actions */}
      <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0">
        {user && (
          <button
            onClick={() => navigate("/library")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            title="Quick Search"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search notes...</span>
            <kbd className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono">
              ⌘K
            </kbd>
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-transparent hover:bg-slate-200 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 transition-all flex items-center justify-center"
          title={`Switch to ${theme === "dark" ? "Light Mode" : "Dark Mode"}`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span>{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium">
            <Link
              to="/login"
              className="px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Controls: Theme & Hamburger Button */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-transparent border border-slate-200 dark:border-white/5"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {user ? (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && user && (
        <div className="absolute top-full left-0 right-0 glass-panel border-b border-slate-200 dark:border-white/10 p-4 space-y-4 md:hidden shadow-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl animate-fade-in z-50">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                isActive("/dashboard")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/library"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                isActive("/library") || location.pathname.startsWith("/document")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <span>Document Library</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/revision"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                isActive("/revision")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <span>Revision Workspace</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/5">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Account</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

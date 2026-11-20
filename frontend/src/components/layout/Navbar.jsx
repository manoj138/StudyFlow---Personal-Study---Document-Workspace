import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  LogOut,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  ChevronRight,
  Mic,
  BookOpen,
  LayoutDashboard,
  RotateCcw
} from "lucide-react";
import { Button, Badge, Kbd } from "../ui";

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
    <header className="sticky top-0 z-30 w-full bg-[#0E1015]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-zinc-100 font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      {/* Brand Logo & Tag */}
      <Link
        to={user ? "/dashboard" : "/"}
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-2.5 group shrink-0"
      >
        <img
          src="/logo.png"
          alt="StudyFlow Logo"
          className="w-7 h-7 object-contain"
        />
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sm sm:text-base tracking-tight text-zinc-100">
            Study<span className="text-zinc-400">Flow</span>
          </span>
          <Badge variant="neutral" size="sm">Workspace</Badge>
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      {user && (
        <nav className="hidden md:flex items-center gap-1 bg-[#08090C] p-1 rounded-md border border-white/[0.08] text-xs font-medium">
          <Link
            to="/dashboard"
            className={`px-3 py-1 rounded-[4px] transition-colors flex items-center gap-1.5 select-none ${
              isActive("/dashboard")
                ? "bg-[#1C202C] text-zinc-100 shadow-sm border border-white/[0.12] font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            <LayoutDashboard size={13} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/interview"
            className={`px-3 py-1 rounded-[4px] transition-colors flex items-center gap-1.5 select-none ${
              isActive("/interview") || location.pathname.startsWith("/interview")
                ? "bg-[#1C202C] text-zinc-100 shadow-sm border border-white/[0.12] font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            <Mic size={13} className="text-indigo-400" />
            <span>Interview Hub</span>
          </Link>

          <Link
            to="/library"
            className={`px-3 py-1 rounded-[4px] transition-colors flex items-center gap-1.5 select-none ${
              isActive("/library") || location.pathname.startsWith("/document")
                ? "bg-[#1C202C] text-zinc-100 shadow-sm border border-white/[0.12] font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            <BookOpen size={13} />
            <span>Library</span>
          </Link>

          <Link
            to="/revision"
            className={`px-3 py-1 rounded-[4px] transition-colors flex items-center gap-1.5 select-none ${
              isActive("/revision")
                ? "bg-[#1C202C] text-zinc-100 shadow-sm border border-white/[0.12] font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            <RotateCcw size={13} />
            <span>Revision</span>
          </Link>
        </nav>
      )}

      {/* Desktop Right Controls */}
      <div className="hidden md:flex items-center gap-2 sm:gap-2.5 shrink-0">
        {user && (
          <button
            onClick={() => navigate("/library")}
            className="flex items-center gap-2 h-8 px-2.5 rounded-md bg-[#08090C] border border-white/[0.08] text-xs text-zinc-400 hover:text-zinc-200 hover:border-white/[0.14] transition-colors cursor-pointer"
            title="Quick Search"
          >
            <Search size={13} />
            <span className="font-mono text-[11px]">Search...</span>
            <Kbd>/</Kbd>
          </button>
        )}

        <Button
          variant="ghost"
          size="sm"
          icon={theme === "dark" ? Sun : Moon}
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light Mode" : "Dark Mode"}`}
        />

        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-[#08090C] border border-white/[0.08] px-2.5 py-1 rounded-md">
              <div className="w-4 h-4 rounded-full bg-zinc-700 text-zinc-200 flex items-center justify-center text-[10px] font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="truncate max-w-[120px]">{user.name}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              title="Logout"
              className="text-zinc-400 hover:text-rose-400"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex md:hidden items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={theme === "dark" ? Sun : Moon}
          onClick={toggleTheme}
        />

        {user ? (
          <Button
            variant="secondary"
            size="sm"
            icon={mobileMenuOpen ? X : Menu}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        ) : (
          <Link to="/login">
            <Button variant="primary" size="sm">Sign In</Button>
          </Link>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && user && (
        <div className="absolute top-full left-0 right-0 border-b border-white/[0.08] p-4 space-y-3 md:hidden shadow-2xl bg-[#0E1015] z-50">
          <div className="flex items-center gap-2.5 p-3 rounded-md bg-[#08090C] border border-white/[0.08]">
            <div className="w-8 h-8 rounded-full bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-100">{user.name}</h4>
              <p className="text-[11px] font-mono text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full p-2.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                isActive("/dashboard")
                  ? "bg-[#1C202C] text-zinc-100 font-semibold border border-white/[0.12]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <span>Dashboard</span>
              <ChevronRight size={13} className="text-zinc-500" />
            </Link>

            <Link
              to="/interview"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full p-2.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                isActive("/interview")
                  ? "bg-[#1C202C] text-zinc-100 font-semibold border border-white/[0.12]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic size={13} className="text-indigo-400" />
                <span>Interview Hub</span>
              </div>
              <ChevronRight size={13} className="text-zinc-500" />
            </Link>

            <Link
              to="/library"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full p-2.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                isActive("/library")
                  ? "bg-[#1C202C] text-zinc-100 font-semibold border border-white/[0.12]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <span>Document Library</span>
              <ChevronRight size={13} className="text-zinc-500" />
            </Link>

            <Link
              to="/revision"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full p-2.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                isActive("/revision")
                  ? "bg-[#1C202C] text-zinc-100 font-semibold border border-white/[0.12]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <span>Revision Center</span>
              <ChevronRight size={13} className="text-zinc-500" />
            </Link>
          </div>

          <div className="pt-2 border-t border-white/[0.08]">
            <Button
              variant="danger"
              size="sm"
              icon={LogOut}
              className="w-full"
              onClick={handleLogout}
            >
              Logout Account
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

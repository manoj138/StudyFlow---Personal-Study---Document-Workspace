import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import {
  BookOpen,
  FileText,
  Plus,
  FolderPlus,
  CheckCircle2,
  Code,
  Brain,
  Microscope,
  Calculator,
  RotateCcw,
  BarChart2,
  ChevronRight,
  Upload,
  Mic,
  Briefcase,
  Terminal,
  Layers,
  ArrowRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "../components/common/Modal";
import { getDailySprint } from "../services/interviewService";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  MetricCard,
  PageHeader
} from "../components/ui";

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [, setBookmarksCount] = useState(0);
  const [, setHighlightsCount] = useState(0);
  const [, setContinueDoc] = useState(null);
  const [, setTotalReadingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sprintData, setSprintData] = useState(null);

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
        const [bRes, hRes, spRes] = await Promise.all([
          API.get("/annotations/bookmarks"),
          API.get("/annotations/highlights"),
          getDailySprint()
        ]);
        if (bRes.data?.success) setBookmarksCount(bRes.data.data.length);
        if (hRes.data?.success) setHighlightsCount(hRes.data.data.length);
        if (spRes?.success) setSprintData(spRes);
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

  // Dynamic Weekly Activity Breakdown
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto font-sans">
      {/* Top Command Bar */}
      <PageHeader
        breadcrumb="STUDYFLOW // DEV COCKPIT // MERN TRACK"
        title={`Welcome back, ${user?.name || "Manoj"}`}
        description="MERN Stack Engineer • 11 Months Production Experience • Placement Target: December 2026"
        actions={
          <>
            <Button
              variant="indigo"
              size="sm"
              icon={Mic}
              onClick={() => navigate("/interview")}
            >
              Interview Studio
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Upload}
              onClick={() => navigate("/library")}
            >
              Upload Notes
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setShowSubjectModal(true)}
            >
              Add Track
            </Button>
          </>
        }
      />

      {/* 4 Quantitative Developer Readiness Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="MERN Question Bank"
          value={sprintData?.stats?.totalQuestions || 250}
          subtext="Comprehensive Curriculum"
          icon={Brain}
          onClick={() => navigate("/interview")}
        />

        <MetricCard
          label="Conceptually Mastered"
          value={sprintData?.stats?.masteredCount || 0}
          subtext="Retained Long-Term"
          icon={CheckCircle2}
          onClick={() => navigate("/revision")}
        />

        <MetricCard
          label="Due for Review"
          value={sprintData?.stats?.dueCount || 0}
          subtext="Active Recall Queue"
          icon={RotateCcw}
          onClick={() => navigate("/revision")}
        />

        <MetricCard
          label="Job Readiness"
          value={`${sprintData?.stats?.readinessScore || 0}%`}
          subtext="Target: December 2026"
          icon={Briefcase}
          onClick={() => navigate("/interview")}
        />
      </div>

      {/* DAILY ACTIVE RECALL SPRINT */}
      {sprintData?.sprintQuestions?.length > 0 && (
        <Card className="border-indigo-500/20 bg-gradient-to-b from-[#121215] to-[#0e0e11]">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm">
                  Daily Active Recall Sprint
                </Badge>
                <span className="text-xs text-zinc-400 font-mono">
                  {sprintData.sprintQuestions.length} Questions Scheduled Today
                </span>
              </div>
              <CardDescription>
                Reinforce technical answers and deepen conceptual recall.
              </CardDescription>
            </div>

            <Button
              variant="indigo"
              size="sm"
              icon={ArrowRight}
              onClick={() => {
                const first = sprintData.sprintQuestions[0];
                if (first?.setId) navigate(`/interview/${first.setId}`);
                else navigate("/interview");
              }}
            >
              Start Sprint
            </Button>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sprintData.sprintQuestions.slice(0, 3).map((q, idx) => (
                <Card
                  key={q.questionId || idx}
                  interactive
                  onClick={() => navigate(`/interview/${q.setId}`)}
                  className="bg-[#0c0c0e] border-zinc-800/80 p-3.5 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <Badge variant="accent" size="sm">
                        {q.category || "MERN"}
                      </Badge>
                      <span className="font-mono text-zinc-500">Q#{idx + 1}</span>
                    </div>
                    <h4 className="text-xs font-medium text-zinc-200 line-clamp-2 leading-snug">
                      {q.question}
                    </h4>
                    {q.marathiExplanation && (
                      <span className="text-[10px] text-amber-400/80 font-mono block">
                        Concept Note Available
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-zinc-800/80 text-zinc-400">
                    <span className="font-mono text-[10px] text-zinc-500">Review Item</span>
                    <ChevronRight size={13} className="text-zinc-400" />
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3-Column Lower Section: Weekly Activity | Recent Documents | Track Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Col 1: Weekly Activity Chart (5 cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart2 size={15} className="text-zinc-400" />
                <span>Weekly Activity</span>
              </CardTitle>
              <CardDescription>Reading and study hours per day</CardDescription>
            </div>
            <Badge variant="outline" size="sm">This Week</Badge>
          </CardHeader>

          <CardContent>
            <div className="flex items-end justify-between gap-2 pt-4 h-44">
              {dynamicWeekDays.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {w.hours}
                  </span>
                  <div className="w-full bg-zinc-900 rounded-sm overflow-hidden h-32 flex flex-col justify-end p-0.5 border border-zinc-800">
                    <div
                      className="w-full bg-zinc-300 rounded-[2px] transition-all duration-300 group-hover:bg-white"
                      style={{ height: `${w.height}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">{w.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Col 2: Recent Documents List (4 cols) */}
        <Card className="lg:col-span-4 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText size={15} className="text-zinc-400" />
                <span>Recent Documents</span>
              </CardTitle>
              <CardDescription>Library study materials</CardDescription>
            </div>
            <Link to="/library" className="text-xs text-zinc-400 hover:text-zinc-200 font-mono">
              View All ({documents.length})
            </Link>
          </CardHeader>

          <CardContent className="space-y-2">
            {documents.length === 0 ? (
              <div className="p-6 text-center rounded-md bg-zinc-900/40 border border-dashed border-zinc-800 space-y-2">
                <p className="text-xs text-zinc-400">No documents uploaded yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/library")}
                >
                  Upload First Document
                </Button>
              </div>
            ) : (
              documents.slice(0, 4).map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => navigate(`/document/${doc._id}`)}
                  className="p-2.5 rounded-md border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-zinc-700 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-300 bg-zinc-800 border border-zinc-700/60 shrink-0"
                    >
                      <FileText size={14} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                        <span>{doc.subjectId?.name || "General"}</span>
                        <span>•</span>
                        <span>{doc.progress?.completionPercentage || 0}% read</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={13} className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Col 3: MERN Track Breakdown + Quick Navigation (3 cols) */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Terminal size={15} className="text-zinc-400" />
                  <span>Curriculum Plan</span>
                </CardTitle>
                <CardDescription>250 High-Yield Questions</CardDescription>
              </div>
              <Badge variant="accent" size="sm">Q4 2026</Badge>
            </CardHeader>

            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-300 py-1 border-b border-zinc-800/60">
                <span className="font-mono text-[11px]">JavaScript & Async</span>
                <span className="font-mono text-zinc-400">60 Qs</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300 py-1 border-b border-zinc-800/60">
                <span className="font-mono text-[11px]">React & Hooks</span>
                <span className="font-mono text-zinc-400">55 Qs</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300 py-1 border-b border-zinc-800/60">
                <span className="font-mono text-[11px]">Node.js & Express</span>
                <span className="font-mono text-zinc-400">50 Qs</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300 py-1 border-b border-zinc-800/60">
                <span className="font-mono text-[11px]">MongoDB Aggregation</span>
                <span className="font-mono text-zinc-400">45 Qs</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300 py-1">
                <span className="font-mono text-[11px]">Production & Internship</span>
                <span className="font-mono text-zinc-400">40 Qs</span>
              </div>

              <div className="pt-2">
                <Button
                  variant="indigo"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/interview")}
                >
                  Launch Interview Hub
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Mic}
                onClick={() => navigate("/interview")}
              >
                Interviews
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={BookOpen}
                onClick={() => navigate("/library")}
              >
                Library
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={() => navigate("/revision")}
              >
                Revision
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setShowSubjectModal(true)}
              >
                New Track
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Subject Modal */}
      <Modal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        title="Create Study Track"
        icon={FolderPlus}
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Track Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. System Design, Computer Networks"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Core architectural patterns and scalable services"
              value={newSubjectDesc}
              onChange={(e) => setNewSubjectDesc(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setNewSubjectColor(c.hex)}
                  className={`w-6 h-6 rounded-full transition-all ${
                    newSubjectColor === c.hex ? "scale-110 ring-2 ring-zinc-300" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800">
            <Button variant="outline" size="sm" onClick={() => setShowSubjectModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Track
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;

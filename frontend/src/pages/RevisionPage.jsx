import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Bookmark,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  FileText,
  RotateCcw,
  ChevronRight
} from "lucide-react";
import { getDailySprint } from "../services/interviewService";
import { DocumentScannerLoader } from "../components/common/DocumentScannerLoader";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  PageHeader,
  SegmentedTabs
} from "../components/ui";

export const RevisionPage = () => {
  const [documents, setDocuments] = useState([]);
  const [sprintData, setSprintData] = useState(null);
  const [activeTab, setActiveTab] = useState("spaced"); // "spaced" or "documents"
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRevisionFeed();
  }, []);

  const fetchRevisionFeed = async () => {
    try {
      setLoading(true);
      const [docsRes, sprintRes] = await Promise.allSettled([
        API.get("/documents"),
        getDailySprint()
      ]);

      if (docsRes.status === "fulfilled" && docsRes.value?.data?.success) {
        setDocuments(docsRes.value.data.data || []);
      }
      if (sprintRes.status === "fulfilled" && sprintRes.value?.success) {
        setSprintData(sprintRes.value);
      }
    } catch (err) {
      console.error("Failed to load revision items:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFormatBadgeVariant = (filename) => {
    const ext = filename?.split(".").pop()?.toUpperCase() || "FILE";
    if (ext === "PDF") return "danger";
    if (ext === "DOCX" || ext === "DOC") return "accent";
    if (ext === "TXT" || ext === "MD") return "warning";
    return "neutral";
  };

  const dueQuestions = sprintData?.sprintQuestions || [];

  const tabOptions = [
    {
      id: "spaced",
      label: "Active Recall Queue",
      count: dueQuestions.length,
      icon: RotateCcw
    },
    {
      id: "documents",
      label: "Document Notes",
      count: documents.length,
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-[#08090C] text-zinc-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Command Strip */}
      <PageHeader
        breadcrumb="STUDYFLOW // RETENTION ENGINE"
        title="Revision Center"
        description="Spaced repetition schedules questions based on your recall accuracy. Daily review builds permanent technical memory for senior interviews."
        actions={
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Due Today</span>
              <span className="text-base font-bold text-amber-400 font-mono leading-none">
                {dueQuestions.length}
              </span>
            </div>
            <div className="bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Mastered</span>
              <span className="text-base font-bold text-emerald-400 font-mono leading-none">
                {sprintData?.stats?.masteredCount || 0}
              </span>
            </div>
          </div>
        }
      />

      {/* Segmented Tab Switcher */}
      <div>
        <SegmentedTabs
          tabs={tabOptions}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      {loading ? (
        <DocumentScannerLoader message="Loading Revision Feed..." fullScreen={false} />
      ) : activeTab === "spaced" ? (
        dueQuestions.length === 0 ? (
          <Card className="p-10 text-center border-dashed border-zinc-800 max-w-md mx-auto my-8 space-y-3">
            <div className="w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 size={20} />
            </div>
            <CardTitle className="text-sm font-semibold">All caught up for today</CardTitle>
            <CardDescription>
              No questions are currently due for spaced repetition review. Practice past sets or explore the Interview Hub.
            </CardDescription>
            <Button
              variant="indigo"
              size="sm"
              onClick={() => navigate("/interview")}
            >
              Open Interview Hub
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dueQuestions.map((q, idx) => (
              <Card
                key={q.questionId || idx}
                interactive
                onClick={() => navigate(`/interview/${q.setId}`)}
                className="space-y-3 flex flex-col justify-between"
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <Badge variant="accent" size="sm">
                    {q.category || "MERN"}
                  </Badge>
                  <Badge variant="warning" size="sm">
                    Due for Review
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-2 py-0">
                  <h4 className="text-xs sm:text-sm font-medium text-zinc-100 line-clamp-2 leading-snug">
                    {q.question}
                  </h4>
                  {q.marathiExplanation && (
                    <span className="text-[10px] text-amber-400/80 font-mono block">
                      Concept Note Available
                    </span>
                  )}
                </CardContent>

                <CardFooter className="pt-2 text-xs text-zinc-400 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[150px]">
                    {q.setTitle}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-300">
                    Practice <ChevronRight size={13} />
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      ) : documents.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-zinc-800 max-w-md mx-auto my-8 space-y-3">
          <div className="w-10 h-10 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60 flex items-center justify-center mx-auto">
            <BookOpen size={20} />
          </div>
          <CardTitle className="text-sm font-semibold">No study materials yet</CardTitle>
          <CardDescription>
            Upload documents to start reading and generating revision flashcards and notes.
          </CardDescription>
          <Link to="/library">
            <Button variant="primary" size="sm">
              Go to Document Library
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const completion = Math.round(doc.progress?.completionPercentage || 0);
            const ext = doc.fileName?.split(".").pop()?.toUpperCase() || doc.fileType || "FILE";
            const variant = getFormatBadgeVariant(doc.fileName || doc.title);

            return (
              <Card
                key={doc._id}
                interactive
                onClick={() => navigate(`/document/${doc._id}`)}
                className="space-y-3 flex flex-col justify-between"
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <Badge variant="neutral" size="sm">
                    {doc.subjectId?.name || "General"}
                  </Badge>
                  <Badge variant={variant} size="sm">
                    .{ext}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3 py-0">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                      {doc.totalPages || 1} Pages Total • {completion}% Completed
                    </p>
                  </div>

                  <div className="w-full bg-zinc-900 h-1.5 rounded-sm overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-zinc-300 transition-all duration-300"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </CardContent>

                <CardFooter className="pt-2 text-xs text-zinc-400 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Bookmark size={12} /> Bookmarks
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} /> Notes
                    </span>
                  </div>

                  <Button variant="outline" size="sm" icon={ChevronRight}>
                    Revise
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RevisionPage;

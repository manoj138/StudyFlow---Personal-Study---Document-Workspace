import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Shuffle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Trophy,
  Brain,
  AlertCircle
} from "lucide-react";
import {
  getInterviewSetById,
  saveInterviewAttempt,
  evaluateSpokenAnswer,
  reviewQuestion
} from "../services/interviewService";
import speechEngine from "../utils/speechSynthesis";
import { useSpeechRecognition } from "../utils/speechRecognition";
import { computeLiveScore } from "../utils/answerEvaluator";
import { VoiceWaveVisualizer } from "../components/interview/VoiceWaveVisualizer";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Kbd,
  MetricCard,
  CodeSnippet
} from "../components/ui";

export const InterviewRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Interview Set Data
  const [interviewSet, setInterviewSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Self-study active recall states
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  const [enableVoiceMode, setEnableVoiceMode] = useState(false);

  // Audio & Speech States
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [autoSpeakEnabled] = useState(false);

  // Candidate Answer State & Submission
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [, setCurrentResult] = useState(null);

  // Full Session Results
  const [sessionResults, setSessionResults] = useState({});
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Status message for spaced repetition rating
  const [reviewStatusMsg, setReviewStatusMsg] = useState("");

  const handleRateQuestion = async (rating, autoAdvance = true) => {
    if (!currentQuestion?._id || !interviewSet?._id) return;
    try {
      const res = await reviewQuestion(interviewSet._id, currentQuestion._id, rating);
      if (res.success) {
        setReviewStatusMsg(`✓ ${res.message}`);
        setTimeout(() => setReviewStatusMsg(""), 3000);
        if (autoAdvance) {
          setTimeout(() => {
            if (currentIndex < questions.length - 1) {
              setCurrentIndex((prev) => prev + 1);
            }
          }, 400);
        }
      }
    } catch (err) {
      console.error("Failed to rate question:", err);
    }
  };

  // Hook for microphone speech recognition
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  } = useSpeechRecognition({
    onResultChange: (text) => {
      setUserAnswer(text);
    }
  });

  // Load interview set
  useEffect(() => {
    loadInterview();
    return () => {
      speechEngine.stop();
    };
  }, [id]);

  const loadInterview = async () => {
    try {
      setLoading(true);
      const res = await getInterviewSetById(id);
      if (res.success && res.interviewSet) {
        setInterviewSet(res.interviewSet);
        const qList = res.interviewSet.questions || [];
        setQuestions(qList);
        if (qList.length > 0) {
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      console.error("Failed to load interview room:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex] || null;

  // Question Change Handler
  useEffect(() => {
    if (!currentQuestion) return;

    speechEngine.stop();
    stopListening();
    resetTranscript();
    setShowIdealAnswer(false);
    setReviewStatusMsg("");

    if (sessionResults[currentQuestion._id]) {
      const prev = sessionResults[currentQuestion._id];
      setUserAnswer(prev.userAnswer || "");
      setCurrentResult(prev);
    } else {
      setUserAnswer("");
      setCurrentResult(null);
    }

    if (autoSpeakEnabled) {
      speakCurrentQuestion(getCleanQuestionText(currentQuestion.question));
    }
  }, [currentIndex, currentQuestion?._id]);

  // Keyboard-first shortcuts (Space, 1, 2, 3, ArrowRight, ArrowLeft)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["TEXTAREA", "INPUT"].includes(e.target?.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        setShowIdealAnswer((prev) => !prev);
      } else if (e.key === "1") {
        e.preventDefault();
        handleRateQuestion("again");
      } else if (e.key === "2") {
        e.preventDefault();
        handleRateQuestion("good");
      } else if (e.key === "3") {
        e.preventDefault();
        handleRateQuestion("easy");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, currentQuestion?._id, questions.length, showIdealAnswer]);

  // Session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!sessionCompleted) {
        setSessionDuration((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionCompleted]);

  // Speech engine
  const speakCurrentQuestion = (text) => {
    if (!text) return;
    setIsAiSpeaking(true);
    speechEngine.speak(text, {
      rate: 0.95,
      onStart: () => setIsAiSpeaking(true),
      onEnd: () => setIsAiSpeaking(false),
      onError: () => setIsAiSpeaking(false)
    });
  };

  const handleToggleSpeak = () => {
    if (isAiSpeaking) {
      speechEngine.stop();
      setIsAiSpeaking(false);
    } else if (currentQuestion) {
      speakCurrentQuestion(getCleanQuestionText(currentQuestion.question));
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      speechEngine.stop();
      setIsAiSpeaking(false);
      startListening();
    }
  };

  // Submit Answer for Optional Voice Studio
  const handleEvaluate = async () => {
    if (!currentQuestion) return;

    stopListening();
    speechEngine.stop();
    setEvaluating(true);

    const spokenText = (userAnswer || transcript || "").trim();

    const localEval = computeLiveScore(
      currentQuestion.answer,
      spokenText,
      currentQuestion.keywords || []
    );

    let finalScore = localEval.score;
    let matchedKeywords = localEval.matchedKeywords;
    let missedKeywords = localEval.missedKeywords;
    let feedback = localEval.feedback;

    try {
      const serverRes = await evaluateSpokenAnswer({
        question: currentQuestion.question,
        idealAnswer: currentQuestion.answer,
        userAnswer: spokenText,
        keywords: currentQuestion.keywords || []
      });

      if (serverRes?.success && serverRes.evaluation) {
        const aiEval = serverRes.evaluation;
        finalScore = typeof aiEval.score === "number" ? aiEval.score : localEval.score;
        matchedKeywords = aiEval.matchedKeywords?.length ? aiEval.matchedKeywords : localEval.matchedKeywords;
        missedKeywords = aiEval.missedKeywords?.length ? aiEval.missedKeywords : localEval.missedKeywords;
        feedback = aiEval.feedback || localEval.feedback;
      }
    } catch (err) {
      console.warn("Server AI evaluation fallback to heuristic:", err);
    }

    const evaluationResult = {
      questionId: currentQuestion._id,
      question: currentQuestion.question,
      idealAnswer: currentQuestion.answer,
      userAnswer: spokenText,
      score: finalScore,
      matchedKeywords,
      missedKeywords,
      feedback: feedback || "Answer submitted."
    };

    setCurrentResult(evaluationResult);
    setSessionResults((prev) => ({
      ...prev,
      [currentQuestion._id]: evaluationResult
    }));

    setShowIdealAnswer(true);
    setEvaluating(false);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishSession();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
  };

  const handleFinishSession = async () => {
    speechEngine.stop();
    stopListening();
    setSessionCompleted(true);

    const answeredList = Object.values(sessionResults);
    const avgScore =
      answeredList.length > 0
        ? Math.round(answeredList.reduce((acc, r) => acc + (r.score || 0), 0) / answeredList.length)
        : 0;

    try {
      await saveInterviewAttempt(id, {
        mode: enableVoiceMode ? "mock" : "study",
        totalQuestions: questions.length,
        questionsAnswered: answeredList.length,
        averageScore: avgScore,
        durationSeconds: sessionDuration,
        results: answeredList
      });
    } catch (err) {
      console.error("Failed to save interview attempt:", err);
    }
  };

  // Clean question text so leaked answers or headers are NEVER displayed in the question card
  const getCleanQuestionText = (qStr) => {
    if (!qStr) return "";
    let clean = qStr.replace(/^.*?\(?\d+\s*questions?\)?\s*/i, "");
    clean = clean.replace(/^Q(?:uestion)?\s*\d*[\):.-]\s*/i, "");
    clean = clean.replace(/^[:.)-\s]+/, "");
    // Check if answer is leaked inside question
    const ansIdx = clean.search(/\s+(?:ans(?:wer)?\s*[:.)-]?|\bA\s*[\):.-])\s+/i);
    if (ansIdx !== -1) {
      clean = clean.slice(0, ansIdx);
    }
    return clean.trim();
  };

  // Clean model answer so if it was leaked in question, it's displayed properly in revealed state
  const getCleanAnswerText = (qObj) => {
    if (!qObj) return "";
    let ans = qObj.answer || "";
    // If answer was placeholder or fallback, but question contained leaked answer
    const leakedMatch = qObj.question?.match(/\s+(?:ans(?:wer)?\s*[:.)-]?|\bA\s*[\):.-])\s+([\s\S]*)$/i);
    if (leakedMatch && (!ans || ans.includes("Review core concept") || ans.includes("Review the model answer"))) {
      ans = leakedMatch[1].trim();
    }
    return ans.replace(/^ans(?:wer)?\s*[:.)-]?\s*/i, "").trim();
  };

  // Helper to render code snippets inside technical answers
  const renderAnswerContent = (text) => {
    if (!text) return null;
    if (text.includes("```")) {
      const parts = text.split(/(```[\s\S]*?```)/g);
      return parts.map((part, i) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].trim();
          const lang = ["javascript", "js", "html", "css", "json", "bash", "ts", "typescript"].includes(
            firstLine.toLowerCase()
          )
            ? firstLine.toLowerCase()
            : "javascript";
          const code = (lang === firstLine.toLowerCase() ? lines.slice(1) : lines).join("\n");
          return <CodeSnippet key={i} code={code} language={lang} className="my-3" />;
        }
        return (
          <p key={i} className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans my-2">
            {part}
          </p>
        );
      });
    }
    return (
      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
        {text}
      </p>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090C] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-zinc-400">Loading interview room...</p>
        </div>
      </div>
    );
  }

  if (!interviewSet || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#08090C] flex items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full p-6 space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-base font-semibold text-zinc-100">No questions found in this set</h2>
          <p className="text-xs text-zinc-400">
            This interview set doesn't have any extracted questions.
          </p>
          <Button variant="secondary" onClick={() => navigate("/interview")} className="w-full">
            Back to Interview Hub
          </Button>
        </Card>
      </div>
    );
  }

  // Session Summary Screen
  if (sessionCompleted) {
    const answeredList = Object.values(sessionResults);
    const avgScore =
      answeredList.length > 0
        ? Math.round(answeredList.reduce((acc, r) => acc + (r.score || 0), 0) / answeredList.length)
        : 0;

    const minutes = Math.floor(sessionDuration / 60);
    const seconds = sessionDuration % 60;

    return (
      <div className="min-h-screen bg-[#08090C] p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto flex items-center justify-center font-sans">
        <Card className="w-full space-y-6 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="space-y-1">
              <Badge variant="success" icon={Trophy}>Session Completed</Badge>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
                Practice Session Summary
              </h1>
              <p className="text-xs text-zinc-400 font-mono">
                {interviewSet.title} • {interviewSet.topic}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                setSessionResults({});
                setCurrentIndex(0);
                setSessionCompleted(false);
                setSessionDuration(0);
              }}
            >
              Restart
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label="Overall Score"
              value={`${avgScore}%`}
              subtext={avgScore >= 75 ? "High Readiness" : "Needs Review"}
            />
            <MetricCard
              label="Questions"
              value={`${answeredList.length}/${questions.length}`}
              subtext="Reviewed"
            />
            <MetricCard
              label="Duration"
              value={`${minutes}m ${seconds}s`}
              subtext="Total Practice"
            />
            <MetricCard
              label="Mode"
              value={enableVoiceMode ? "Voice Drill" : "Active Recall"}
              subtext="Self-Study"
            />
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              Question Breakdown ({questions.length})
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const res = sessionResults[q._id];
                return (
                  <div
                    key={q._id}
                    className="p-3 rounded-md bg-zinc-900/60 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 max-w-[80%]">
                      <span className="font-medium text-zinc-200 block">
                        Q{idx + 1}: {q.question}
                      </span>
                      {res?.userAnswer && (
                        <p className="text-zinc-400 italic text-[11px] line-clamp-1 font-mono">
                          "{res.userAnswer}"
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {res ? (
                        <Badge
                          variant={res.score >= 75 ? "success" : res.score >= 50 ? "warning" : "danger"}
                        >
                          {res.score}%
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Reviewed</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <Button variant="outline" onClick={() => navigate("/interview")}>
              Back to Interview Hub
            </Button>
            <Button variant="primary" onClick={() => navigate("/revision")}>
              Open Revision Center
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090C] text-zinc-100 font-sans flex flex-col justify-between">
      {/* Top Header Command Bar */}
      <header className="bg-[#0E1015] border-b border-white/[0.08] px-4 sm:px-8 py-2.5 sticky top-0 z-20 flex items-center justify-between gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Left: Back & Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => {
              speechEngine.stop();
              stopListening();
              navigate("/interview");
            }}
            title="Exit Room"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-semibold text-zinc-100 line-clamp-1">
                {interviewSet.title}
              </h2>
              <Badge variant="neutral" size="sm">{interviewSet.topic}</Badge>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              {questions.length > 20 && (
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-[10px] text-zinc-400">Jump:</span>
                  <input
                    type="number"
                    min="1"
                    max={questions.length}
                    placeholder="#"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= questions.length) {
                          setCurrentIndex(val - 1);
                          e.target.value = "";
                        }
                      }
                    }}
                    className="w-14 px-1.5 py-0.5 bg-zinc-900 border border-zinc-700/80 rounded text-[11px] font-mono text-zinc-100 text-center focus:outline-none focus:border-indigo-400"
                    title={`Type question 1-${questions.length} and press Enter`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Command Shortcuts Legend */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-md border border-zinc-800 text-[11px] font-mono text-zinc-400">
          <span className="text-zinc-500">Shortcuts:</span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Kbd>Space</Kbd> Reveal
          </span>
          <span className="text-zinc-700">•</span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Kbd>1</Kbd> Again
          </span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Kbd>2</Kbd> Good
          </span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Kbd>3</Kbd> Mastered
          </span>
          <span className="text-zinc-700">•</span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Kbd>→</Kbd> Next
          </span>
        </div>

        {/* Right: Practice Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={enableVoiceMode ? "success" : "outline"}
            size="sm"
            icon={enableVoiceMode ? Mic : MicOff}
            onClick={() => {
              if (enableVoiceMode) {
                stopListening();
                speechEngine.stop();
              }
              setEnableVoiceMode((prev) => !prev);
            }}
            title="Toggle candidate voice recording drill"
          >
            {enableVoiceMode ? "Voice Drill: ON" : "Voice Drill: OFF"}
          </Button>

          <Button variant="secondary" size="sm" onClick={handleFinishSession}>
            Finish Review
          </Button>
        </div>
      </header>

      {/* High-Precision Progress Bar */}
      <div className="w-full h-1 bg-zinc-900">
        <div
          className="h-full bg-zinc-200 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Studio Arena */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-5">
        {/* QUESTION CARD */}
        <Card className="space-y-4">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="accent" size="sm">
                Question #{currentIndex + 1} of {questions.length}
              </Badge>
              <Badge variant="neutral" size="sm">
                {currentQuestion.category || currentQuestion.track || interviewSet.topic}
              </Badge>
              <Badge
                variant={
                  currentQuestion.difficulty === "hard"
                    ? "danger"
                    : currentQuestion.difficulty === "easy"
                    ? "success"
                    : "warning"
                }
                size="sm"
              >
                {currentQuestion.difficulty || "medium"}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={isAiSpeaking ? VolumeX : Volume2}
              onClick={handleToggleSpeak}
              title="Pronounce technical question"
            >
              {isAiSpeaking ? "Stop Audio" : "Listen"}
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-100 leading-snug">
              {getCleanQuestionText(currentQuestion.question)}
            </h2>

            {/* Spacebar Reveal Button */}
            <Button
              variant={showIdealAnswer ? "secondary" : "indigo"}
              size="lg"
              className="w-full"
              shortcut="Space"
              icon={showIdealAnswer ? EyeOff : Eye}
              onClick={() => setShowIdealAnswer((prev) => !prev)}
            >
              {showIdealAnswer ? "Hide Model Answer" : "Reveal Model Answer & Key Concepts"}
            </Button>
          </CardContent>
        </Card>

        {/* MODEL ANSWER & CONCEPT BREAKDOWN (REVEALED STATE) */}
        <AnimatePresence>
          {showIdealAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-4"
            >
              {/* Standard Technical English Answer */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-zinc-400" />
                    <CardTitle className="text-xs uppercase font-mono tracking-wider text-zinc-300">
                      Standard Technical Benchmark
                    </CardTitle>
                  </div>
                  <Badge variant="neutral" size="sm">Interview Standard</Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  {renderAnswerContent(getCleanAnswerText(currentQuestion))}

                  {/* Expected Interview Keywords */}
                  {currentQuestion.keywords?.length > 0 && (
                    <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                        Expected Technical Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentQuestion.keywords.map((kw, i) => (
                          <Badge key={i} variant="accent" size="sm">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Marathi Concept Breakdown */}
              {currentQuestion.marathiExplanation && (
                <Card className="border-amber-500/20 bg-amber-500/[0.03]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
                      <Brain size={14} />
                      <span>💡 Concept Explanation (मराठी स्पष्टीकरण)</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                      {currentQuestion.marathiExplanation}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Spaced Repetition Active Recall Rating Suite */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw size={14} className="text-zinc-400" />
                    <span className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                      Active Recall Self-Rating
                    </span>
                  </div>
                  {reviewStatusMsg && (
                    <span className="text-emerald-400 font-mono text-xs font-semibold animate-pulse">
                      {reviewStatusMsg}
                    </span>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      variant="danger"
                      shortcut="1"
                      className="h-auto py-3 flex-col gap-1 text-center"
                      onClick={() => handleRateQuestion("again")}
                    >
                      <span className="font-semibold text-xs">Again</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Review Tomorrow</span>
                    </Button>

                    <Button
                      variant="warning"
                      shortcut="2"
                      className="h-auto py-3 flex-col gap-1 text-center"
                      onClick={() => handleRateQuestion("good")}
                    >
                      <span className="font-semibold text-xs">Good</span>
                      <span className="text-[10px] text-zinc-400 font-mono">In 3 Days</span>
                    </Button>

                    <Button
                      variant="success"
                      shortcut="3"
                      className="h-auto py-3 flex-col gap-1 text-center"
                      onClick={() => handleRateQuestion("easy")}
                    >
                      <span className="font-semibold text-xs">Mastered</span>
                      <span className="text-[10px] text-zinc-400 font-mono">In 7 Days</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OPTIONAL CANDIDATE VOICE STUDIO (ONLY WHEN EXPLICITLY TOGGLED ON) */}
        {enableVoiceMode && (
          <Card className="border-emerald-500/30">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isListening ? "bg-emerald-400 animate-ping" : "bg-zinc-600"}`} />
                <CardTitle className="text-xs uppercase font-mono tracking-wider text-zinc-300">
                  Optional Candidate Spoken Dictation
                </CardTitle>
              </div>
              {userAnswer && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => {
                    resetTranscript();
                    setUserAnswer("");
                    setCurrentResult(null);
                  }}
                  title="Clear Answer"
                />
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-3 py-4 bg-zinc-950/60 rounded-md border border-zinc-800/80">
                <VoiceWaveVisualizer
                  isActive={isListening || isAiSpeaking}
                  role={isListening ? "candidate" : "interviewer"}
                  label={isListening ? "Listening to your spoken answer..." : "Microphone Ready"}
                />

                <Button
                  variant={isListening ? "danger" : "indigo"}
                  size="lg"
                  icon={isListening ? MicOff : Mic}
                  onClick={handleToggleMic}
                  className="rounded-full px-6"
                >
                  {isListening ? "Stop Recording" : "Start Voice Recording"}
                </Button>
              </div>

              <textarea
                rows={3}
                placeholder="Dictated spoken answer will appear here, or type manually..."
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setTranscript(e.target.value);
                }}
                className="w-full p-3 rounded-md bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono leading-relaxed"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500">
                  {userAnswer ? userAnswer.trim().split(/\s+/).filter(Boolean).length : 0} words
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  loading={evaluating}
                  disabled={evaluating || !userAnswer.trim()}
                  onClick={handleEvaluate}
                >
                  Submit & Score
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom Fixed Action Bar */}
      <footer className="bg-[#0E1015] border-t border-white/[0.08] px-4 sm:px-8 py-3 sticky bottom-0 z-20 flex items-center justify-between gap-3 shadow-[0_-1px_0_rgba(255,255,255,0.06)]">
        <Button
          variant="outline"
          size="sm"
          icon={ChevronLeft}
          disabled={currentIndex === 0}
          onClick={handlePrev}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            shortcut="Space"
            onClick={() => setShowIdealAnswer((prev) => !prev)}
            className="hidden sm:inline-flex"
          >
            {showIdealAnswer ? "Hide" : "Reveal"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={Shuffle}
            onClick={handleShuffle}
            title="Randomize Questions"
          />
        </div>

        <Button
          variant="indigo"
          size="sm"
          icon={ChevronRight}
          onClick={handleNext}
        >
          {currentIndex === questions.length - 1 ? "Finish Session" : "Next Question"}
        </Button>
      </footer>
    </div>
  );
};

export default InterviewRoomPage;

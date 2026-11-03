import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Trophy,
  Award,
  Zap,
  HelpCircle,
  Edit3,
  Send,
  Flag,
  Share2
} from "lucide-react";
import {
  getInterviewSetById,
  saveInterviewAttempt,
  evaluateSpokenAnswer
} from "../services/interviewService";
import speechEngine from "../utils/speechSynthesis";
import { useSpeechRecognition } from "../utils/speechRecognition";
import { computeLiveScore } from "../utils/answerEvaluator";
import { VoiceWaveVisualizer } from "../components/interview/VoiceWaveVisualizer";

export const InterviewRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Interview Set Data
  const [interviewSet, setInterviewSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mode: "mock" (Pressure/Real with timer & hidden answers) or "practice" (Learning/Read along)
  const [mode, setMode] = useState("mock");
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);

  // Audio & Speech States
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);

  // Timer State (per question)
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Candidate Answer State & Submission
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  // Full Session Results
  const [sessionResults, setSessionResults] = useState({});
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Hook for microphone speech recognition
  const {
    isListening,
    transcript,
    interimTranscript,
    error: micError,
    isSupported: isMicSupported,
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

    // Reset state for new question
    speechEngine.stop();
    stopListening();
    resetTranscript();
    setShowIdealAnswer(mode === "practice");
    setTimerSeconds(60);
    setIsTimerRunning(true);

    // If previously answered in this session, restore result
    if (sessionResults[currentQuestion._id]) {
      const prev = sessionResults[currentQuestion._id];
      setUserAnswer(prev.userAnswer || "");
      setCurrentResult(prev);
    } else {
      setUserAnswer("");
      setCurrentResult(null);
    }

    // Auto speak question if enabled
    if (autoSpeakEnabled) {
      speakCurrentQuestion(currentQuestion.question);
    }
  }, [currentIndex, currentQuestion?._id, mode]);

  // Overall session timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!sessionCompleted) {
        setSessionDuration((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionCompleted]);

  // Question countdown timer
  useEffect(() => {
    if (!isTimerRunning || mode !== "mock" || sessionCompleted || currentResult) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, mode, sessionCompleted, currentResult]);

  // Speak Current Question
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
      speakCurrentQuestion(currentQuestion.question);
    }
  };

  // Toggle Mic Recording
  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      speechEngine.stop();
      setIsAiSpeaking(false);
      startListening();
    }
  };

  // Submit & Evaluate Answer
  const handleEvaluate = async () => {
    if (!currentQuestion) return;

    stopListening();
    speechEngine.stop();
    setEvaluating(true);

    const spokenText = (userAnswer || transcript || "").trim();

    // Step 1: Immediate instant local heuristic evaluation
    const localEval = computeLiveScore(
      currentQuestion.answer,
      spokenText,
      currentQuestion.keywords || []
    );

    let finalScore = localEval.score;
    let matchedKeywords = localEval.matchedKeywords;
    let missedKeywords = localEval.missedKeywords;
    let feedback = localEval.feedback;

    // Step 2: Deep AI evaluation call to server (enhances feedback)
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
      console.warn("Server AI evaluation failed, using local result:", err);
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

  // Navigation
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

  // Complete & Save Session
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
        mode,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Preparing your AI Interview Room...
          </p>
        </div>
      </div>
    );
  }

  if (!interviewSet || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">No questions found in this set</h2>
          <p className="text-xs text-slate-400">
            This interview set doesn't have any extracted questions.
          </p>
          <button
            onClick={() => navigate("/interview")}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Back to Interview Studio
          </button>
        </div>
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
      <div className="min-h-screen p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Mock Interview Completed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Great practice session for <span className="font-semibold text-indigo-500">{interviewSet.title}</span>. Here is your performance breakdown:
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Overall Score</span>
              <span className={`text-3xl font-black font-mono ${avgScore >= 75 ? "text-emerald-500" : avgScore >= 50 ? "text-amber-500" : "text-rose-500"}`}>
                {avgScore}%
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Answered</span>
              <span className="text-3xl font-black font-mono text-indigo-500">
                {answeredList.length}/{questions.length}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Duration</span>
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {minutes}m {seconds}s
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Interview Mode</span>
              <span className="text-lg font-bold capitalize text-slate-900 dark:text-white block mt-1">
                {mode}
              </span>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Question-by-Question Review ({answeredList.length})
            </h3>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const res = sessionResults[q._id];
                return (
                  <div
                    key={q._id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 max-w-[80%]">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        Q{idx + 1}: {q.question}
                      </span>
                      {res ? (
                        <p className="text-slate-500 dark:text-slate-400 italic line-clamp-1">
                          "{res.userAnswer || "Spoken answer submitted"}"
                        </p>
                      ) : (
                        <span className="text-slate-400 italic">Skipped</span>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {res ? (
                        <span
                          className={`font-mono font-bold text-sm px-2 py-0.5 rounded-md ${
                            res.score >= 75
                              ? "bg-emerald-500/10 text-emerald-500"
                              : res.score >= 50
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {res.score}%
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              onClick={() => {
                setSessionResults({});
                setCurrentIndex(0);
                setSessionCompleted(false);
                setSessionDuration(0);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Interview
            </button>
            <button
              onClick={() => navigate("/interview")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              Back to Interview Studio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between">
      {/* Top Header Control Bar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 sm:px-8 py-3 sticky top-0 z-20 flex items-center justify-between gap-4">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speechEngine.stop();
              stopListening();
              navigate("/interview");
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Exit Room"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
              {interviewSet.title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="font-semibold text-indigo-500">{interviewSet.topic}</span>
              <span>•</span>
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-semibold">
          <button
            onClick={() => setMode("mock")}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === "mock"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Real Mock Mode
          </button>
          <button
            onClick={() => setMode("practice")}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === "practice"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Practice / Learn Mode
          </button>
        </div>

        {/* Right: Timer & Finish */}
        <div className="flex items-center gap-3">
          {mode === "mock" && !currentResult && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                timerSeconds <= 15
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span>
            </div>
          )}

          <button
            onClick={handleFinishSession}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            Finish Interview
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Studio Arena */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* INTERVIEWER CARD */}
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200 dark:border-indigo-500/20 p-5 sm:p-7 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* AI Avatar / Wave Visualizer */}
            <div className="shrink-0">
              <VoiceWaveVisualizer
                isActive={isAiSpeaking}
                role="interviewer"
                label={isAiSpeaking ? "Interviewer Speaking..." : "Interviewer Ready"}
              />
            </div>

            {/* Question Content */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Question #{currentIndex + 1}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-white/5">
                  {currentQuestion.category || interviewSet.topic}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    currentQuestion.difficulty === "hard"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      : currentQuestion.difficulty === "easy"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                {currentQuestion.question}
              </h2>

              {/* Speaker Controls */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  onClick={handleToggleSpeak}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
                >
                  {isAiSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Re-read Question</span>
                    </>
                  )}
                </button>

                {mode === "practice" && (
                  <button
                    onClick={() => setShowIdealAnswer((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
                  >
                    {showIdealAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showIdealAnswer ? "Hide Ideal Answer" : "Peek Ideal Answer"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CANDIDATE VOICE & ANSWER STAGE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Your Answer {isListening && "(Listening Live...)"}
              </span>
            </div>

            {/* Mic Switch / Reset */}
            <div className="flex items-center gap-2">
              {userAnswer && (
                <button
                  onClick={() => {
                    resetTranscript();
                    setUserAnswer("");
                    setCurrentResult(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Clear Answer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Real-time Voice Wave / Mic Button */}
          <div className="flex flex-col items-center justify-center gap-3 py-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
            <button
              onClick={handleToggleMic}
              className={`p-5 rounded-full transition-all duration-300 transform active:scale-95 shadow-xl ${
                isListening
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 scale-105 animate-pulse"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-105"
              }`}
            >
              {isListening ? <Mic className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            <div className="text-center space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isListening ? "Tap to Stop Speaking" : "Tap Microphone & Speak Answer"}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isListening
                  ? "Speak naturally — your words appear below in real-time"
                  : "Or type your answer directly in the box below"}
              </p>
            </div>
          </div>

          {/* Transcript / Text Input Area */}
          <div className="relative">
            <textarea
              rows={4}
              placeholder="Your answer will appear here as you speak into the microphone, or type manually..."
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setTranscript(e.target.value);
              }}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
            />
            {interimTranscript && (
              <p className="absolute bottom-3 left-4 right-4 text-xs text-indigo-500 dark:text-indigo-400 italic pointer-events-none line-clamp-1">
                ... {interimTranscript}
              </p>
            )}
          </div>

          {/* Submit / Evaluate Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Words: {userAnswer ? userAnswer.trim().split(/\s+/).filter(Boolean).length : 0}
            </span>

            <button
              onClick={handleEvaluate}
              disabled={evaluating || !userAnswer.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              {evaluating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit & Score Answer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* EVALUATION FEEDBACK & IDEAL ANSWER REVEAL */}
        <AnimatePresence>
          {(currentResult || showIdealAnswer) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              {/* Scorecard Box */}
              {currentResult && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        AI Interviewer Assessment
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Accuracy:</span>
                      <span
                        className={`text-lg font-black font-mono px-2.5 py-0.5 rounded-lg ${
                          currentResult.score >= 75
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : currentResult.score >= 50
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}
                      >
                        {currentResult.score}%
                      </span>
                    </div>
                  </div>

                  {/* Feedback text */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-white/5">
                    💡 <span className="font-semibold">Feedback:</span> {currentResult.feedback}
                  </p>

                  {/* Keywords Comparison */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Core Concept Keywords
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentResult.matchedKeywords?.map((kw, i) => (
                        <span
                          key={`m-${i}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        >
                          <CheckCircle2 className="w-3 h-3" /> {kw}
                        </span>
                      ))}
                      {currentResult.missedKeywords?.map((kw, i) => (
                        <span
                          key={`x-${i}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        >
                          <XCircle className="w-3 h-3" /> Missed: {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Model / Ideal Answer Reveal */}
              {(showIdealAnswer || currentResult) && (
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-indigo-500/20 p-5 sm:p-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Ideal Model Answer
                    </span>
                    <button
                      onClick={() => setShowIdealAnswer((prev) => !prev)}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      {showIdealAnswer ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showIdealAnswer && (
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200 dark:border-white/5 whitespace-pre-wrap">
                      {currentQuestion.answer}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-white/10 px-4 sm:px-8 py-3 sticky bottom-0 z-20 flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Randomize / Shuffle Questions"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <span>{currentIndex === questions.length - 1 ? "Finish Session" : "Next Question"}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};


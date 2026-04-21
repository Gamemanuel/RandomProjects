"use client";

import React, { useState } from "react";
import { BookOpen, Upload, BarChart2, GraduationCap, Menu, X } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import StudySession from "@/components/StudySession";
import Statistics from "@/components/Statistics";
import { Question, QuestionStats, StudyPhase } from "@/types";

type SidebarItem = "upload" | "study" | "stats";

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [phase, setPhase] = useState<StudyPhase>("upload");
  const [stats, setStats] = useState<Record<number, QuestionStats>>({});
  const [studyQueue, setStudyQueue] = useState<Question[]>([]);
  const [masteryMode, setMasteryMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleQuestionsLoaded = (loaded: Question[]) => {
    setQuestions(loaded);
    setStats({});
    setStudyQueue(loaded);
    setMasteryMode(false);
  };

  const startStudy = () => {
    if (questions.length === 0) return;
    setStudyQueue(questions);
    setMasteryMode(false);
    setPhase("study");
  };

  const handleStudyComplete = (newStats: Record<number, QuestionStats>) => {
    setStats(newStats);
    setPhase("stats");
  };

  const handleContinue = (incorrectQuestions: Question[]) => {
    setStudyQueue(incorrectQuestions);
    setMasteryMode(true);
    setPhase("study");
  };

  const handleRestart = () => {
    setStats({});
    setStudyQueue(questions);
    setMasteryMode(false);
    setPhase("study");
  };

  const handleHome = () => {
    setPhase("upload");
    setStats({});
    setQuestions([]);
    setStudyQueue([]);
    setMasteryMode(false);
  };

  const handleExit = () => {
    if (Object.keys(stats).length > 0) {
      setPhase("stats");
    } else {
      setPhase("upload");
    }
  };

  const navItems: {
    id: SidebarItem;
    label: string;
    icon: React.ReactNode;
    available: boolean;
  }[] = [
    {
      id: "upload",
      label: "Upload Questions",
      icon: <Upload className="w-5 h-5" />,
      available: true,
    },
    {
      id: "study",
      label: "Study",
      icon: <BookOpen className="w-5 h-5" />,
      available: questions.length > 0,
    },
    {
      id: "stats",
      label: "Statistics",
      icon: <BarChart2 className="w-5 h-5" />,
      available: Object.keys(stats).length > 0,
    },
  ];

  const handleNavClick = (id: SidebarItem) => {
    if (id === "study" && questions.length > 0) {
      startStudy();
    } else if (id === "stats" && Object.keys(stats).length > 0) {
      setPhase("stats");
    } else if (id === "upload") {
      setPhase("upload");
    }
    setSidebarOpen(false);
  };

  const phaseTitle: Record<StudyPhase, string> = {
    upload: "Upload Questions",
    study: masteryMode ? "Mastery Round" : "Study Session",
    stats: "Your Results",
  };

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-amber-900 text-amber-50 flex flex-col shadow-2xl
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-amber-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">StudyCards</h1>
            <p className="text-xs text-amber-300 mt-0.5">Learn &amp; Master</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              disabled={!item.available}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-150
                ${
                  phase === item.id
                    ? "bg-amber-600 text-white shadow"
                    : item.available
                    ? "text-amber-200 hover:bg-amber-800 hover:text-white"
                    : "text-amber-600 cursor-not-allowed opacity-50"
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Questions loaded indicator */}
        {questions.length > 0 && (
          <div className="p-4 border-t border-amber-700">
            <div className="bg-amber-800 rounded-xl p-3">
              <p className="text-xs text-amber-300">Questions loaded</p>
              <p className="text-lg font-bold">{questions.length}</p>
              <button
                onClick={startStudy}
                className="mt-2 w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-semibold transition-colors"
              >
                Start Studying →
              </button>
            </div>
          </div>
        )}

        {/* Decorative element */}
        <div className="p-4 text-amber-700 text-xs text-center select-none">
          ✏️ Study smarter, not harder
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-amber-50 border-b-2 border-amber-200 px-4 py-3 flex items-center gap-4 shadow-sm">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-amber-100 text-amber-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-lg font-bold text-amber-900">
            {phaseTitle[phase]}
          </h2>
          {questions.length > 0 && phase !== "study" && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full font-medium">
                {questions.length} questions
              </span>
            </div>
          )}
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
          {/* Decorative paper texture stripe */}
          <div className="h-2 bg-amber-200 rounded-full mb-6 opacity-60" />

          {phase === "upload" && (
            <FileUpload onQuestionsLoaded={handleQuestionsLoaded} />
          )}

          {phase === "study" && studyQueue.length > 0 && (
            <StudySession
              key={`${masteryMode}-${studyQueue.map((q) => q.id).join("-")}`}
              questions={studyQueue}
              onComplete={handleStudyComplete}
              onExit={handleExit}
              existingStats={stats}
              masteryMode={masteryMode}
            />
          )}

          {phase === "stats" && (
            <Statistics
              stats={stats}
              questions={questions}
              onContinue={handleContinue}
              onRestart={handleRestart}
              onHome={handleHome}
            />
          )}
        </main>
      </div>
    </div>
  );
}

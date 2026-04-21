"use client";

import React from "react";
import { Trophy, RotateCcw, BookOpen, CheckCircle, XCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question, QuestionStats } from "@/types";

interface StatisticsProps {
  stats: Record<number, QuestionStats>;
  questions: Question[];
  onContinue: (incorrectQuestions: Question[]) => void;
  onRestart: () => void;
  onHome: () => void;
}

export default function Statistics({
  stats,
  questions,
  onContinue,
  onRestart,
  onHome,
}: StatisticsProps) {
  const statsList = Object.values(stats);
  const totalAnswered = statsList.reduce((sum, s) => sum + s.attempts, 0);
  const totalCorrect = statsList.reduce((sum, s) => sum + s.correct, 0);
  const accuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const masteredQuestions = questions.filter((q) => {
    const s = stats[q.id];
    return s && s.attempts > 0 && s.correct > 0 && s.incorrect === 0;
  });

  // Questions the user attempted but got wrong at least once
  const incorrectQuestions = questions.filter((q) => {
    const s = stats[q.id];
    return s && s.attempts > 0 && s.incorrect > 0;
  });

  // Questions never attempted (user exited early)
  const unattemptedQuestions = questions.filter((q) => {
    const s = stats[q.id];
    return !s || s.attempts === 0;
  });

  // Practice queue: questions with errors OR never attempted (all non-mastered)
  const practiceQueue = questions.filter((q) => {
    const s = stats[q.id];
    return !s || s.attempts === 0 || s.incorrect > 0;
  });

  const allMastered = practiceQueue.length === 0;

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <Card
        className={`border-4 ${
          allMastered ? "border-green-400 bg-green-50" : "border-amber-400 bg-amber-50"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl flex-shrink-0 ${
                allMastered ? "bg-green-200" : "bg-amber-200"
              }`}
            >
              {allMastered ? "🏆" : accuracy >= 70 ? "👍" : "📚"}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-amber-900">
                {allMastered
                  ? "Perfect Score! All Mastered! 🎉"
                  : accuracy >= 70
                  ? "Great Job!"
                  : "Keep Studying!"}
              </h2>
              <p className="text-amber-700 mt-1">
                {accuracy}% accuracy — {totalCorrect} correct out of {totalAnswered} attempts
              </p>
            </div>
            <div className="ml-auto flex flex-col gap-2 items-center sm:items-end text-center sm:text-right">
              <div className="text-3xl font-bold text-amber-900">{accuracy}%</div>
              <div className="text-xs text-amber-600">Overall Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-900">{questions.length}</div>
            <div className="text-xs text-amber-600 mt-1">Total Questions</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{masteredQuestions.length}</div>
            <div className="text-xs text-green-600 mt-1">Mastered</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-700">
              {incorrectQuestions.length + unattemptedQuestions.length}
            </div>
            <div className="text-xs text-red-600 mt-1">Need Review</div>
          </CardContent>
        </Card>
      </div>

      {/* Per-question breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.map((q) => {
            const s = stats[q.id];
            const mastered = s && s.correct > 0 && s.incorrect === 0;
            const hasError = s && s.incorrect > 0;
            const unattempted = !s || s.attempts === 0;

            return (
              <div
                key={q.id}
                className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                  mastered
                    ? "border-green-200 bg-green-50"
                    : hasError
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex-shrink-0">
                  {mastered ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : hasError ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-900 truncate">
                    {q.question}
                  </p>
                  {!unattempted && (
                    <p className="text-xs text-amber-600 mt-0.5">
                      {s.attempts} attempt{s.attempts !== 1 ? "s" : ""} ·{" "}
                      {s.correct} correct · {s.incorrect} incorrect
                    </p>
                  )}
                  {unattempted && (
                    <p className="text-xs text-amber-500 mt-0.5">Not attempted</p>
                  )}
                </div>
                {/* Mini accuracy bar */}
                {!unattempted && (
                  <div className="w-16 flex-shrink-0">
                    <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          mastered ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.round((s.correct / s.attempts) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-amber-600 mt-0.5">
                      {Math.round((s.correct / s.attempts) * 100)}%
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!allMastered && (
          <Button
            className="flex-1"
            size="lg"
            onClick={() => onContinue(practiceQueue)}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Practice {practiceQueue.length} Question
            {practiceQueue.length !== 1 ? "s" : ""}
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={onRestart} className="flex-1">
          <RotateCcw className="w-5 h-5 mr-2" />
          Restart All
        </Button>
        <Button variant="ghost" size="lg" onClick={onHome} className="flex-1">
          <Home className="w-5 h-5 mr-2" />
          Home
        </Button>
      </div>
    </div>
  );
}

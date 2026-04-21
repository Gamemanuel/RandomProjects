"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, XCircle, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Question, QuestionStats } from "@/types";

interface StudySessionProps {
  questions: Question[];
  onComplete: (stats: Record<number, QuestionStats>) => void;
  onExit: () => void;
  existingStats?: Record<number, QuestionStats>;
  masteryMode?: boolean;
}

type AnswerState = "unanswered" | "correct" | "incorrect";

export default function StudySession({
  questions,
  onComplete,
  onExit,
  existingStats,
  masteryMode = false,
}: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [stats, setStats] = useState<Record<number, QuestionStats>>(
    existingStats ?? {}
  );
  // Keep a ref so handleNext can always read the latest stats without stale closure
  const statsRef = useRef(stats);

  // Keep ref in sync whenever stats state updates
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = (currentIndex / totalQuestions) * 100;

  // Initialize stats entries for new questions
  useEffect(() => {
    setStats((prev) => {
      const updated = { ...prev };
      for (const q of questions) {
        if (!updated[q.id]) {
          updated[q.id] = {
            questionId: q.id,
            question: q.question,
            attempts: 0,
            correct: 0,
            incorrect: 0,
          };
        }
      }
      return updated;
    });
  }, [questions]);

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (answerState !== "unanswered") return;

      const isCorrect = optionIndex === currentQuestion.correctAnswer;
      setSelectedAnswer(optionIndex);
      setAnswerState(isCorrect ? "correct" : "incorrect");

      setStats((prev) => {
        const existing = prev[currentQuestion.id] ?? {
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          attempts: 0,
          correct: 0,
          incorrect: 0,
        };
        const next = {
          ...prev,
          [currentQuestion.id]: {
            ...existing,
            attempts: existing.attempts + 1,
            correct: existing.correct + (isCorrect ? 1 : 0),
            incorrect: existing.incorrect + (isCorrect ? 0 : 1),
          },
        };
        statsRef.current = next;
        return next;
      });
    },
    [answerState, currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      onComplete(statsRef.current);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setAnswerState("unanswered");
  }, [currentIndex, totalQuestions, onComplete]);

  const getOptionVariant = (index: number) => {
    if (answerState === "unanswered") return "secondary";
    if (index === currentQuestion.correctAnswer) return "correct";
    if (index === selectedAnswer && answerState === "incorrect") return "incorrect";
    return "secondary";
  };

  const getOptionStyle = (index: number) => {
    if (answerState === "unanswered") return "";
    if (index === currentQuestion.correctAnswer) return "ring-2 ring-green-400";
    if (index === selectedAnswer && answerState === "incorrect")
      return "ring-2 ring-red-400";
    return "opacity-60";
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header / progress */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-amber-700">
              {masteryMode ? "📚 Mastery Round" : "📖 Study Session"}
            </span>
            <span className="text-sm text-amber-600">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-3 bg-amber-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-4 text-amber-700 hover:text-red-600 hover:bg-red-50"
          onClick={onExit}
        >
          <LogOut className="w-4 h-4 mr-1" />
          Exit
        </Button>
      </div>

      {/* Question Card */}
      <Card className="flex-1 flex flex-col shadow-lg border-amber-300">
        <CardContent className="flex flex-col flex-1 p-8 gap-6">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl md:text-2xl font-bold text-amber-900 text-center leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Feedback */}
          {answerState !== "unanswered" && (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl font-semibold text-base
              ${
                answerState === "correct"
                  ? "bg-green-50 border-2 border-green-300 text-green-700"
                  : "bg-red-50 border-2 border-red-300 text-red-700"
              }`}
            >
              {answerState === "correct" ? (
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 flex-shrink-0" />
              )}
              {answerState === "correct"
                ? "Correct! Well done! 🎉"
                : `Incorrect. The correct answer is: "${currentQuestion.options[currentQuestion.correctAnswer]}"`}
            </div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={getOptionVariant(index)}
                size="lg"
                className={`h-auto py-4 px-5 text-left justify-start whitespace-normal text-sm leading-snug ${getOptionStyle(index)}`}
                onClick={() => handleAnswer(index)}
                disabled={answerState !== "unanswered"}
              >
                <span className="w-6 h-6 rounded-full bg-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center mr-3 flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </Button>
            ))}
          </div>

          {/* Next button */}
          {answerState !== "unanswered" && (
            <div className="flex justify-end">
              <Button onClick={handleNext} size="lg">
                {currentIndex + 1 >= totalQuestions ? (
                  <>See Results ✓</>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

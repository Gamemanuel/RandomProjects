export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuestionSet {
  questions: Question[];
}

export interface QuestionStats {
  questionId: number;
  question: string;
  attempts: number;
  correct: number;
  incorrect: number;
}

export type StudyPhase = "upload" | "study" | "stats";

export interface StudyState {
  questions: Question[];
  currentIndex: number;
  selectedAnswer: number | null;
  stats: Record<number, QuestionStats>;
  phase: StudyPhase;
  sessionComplete: boolean;
}

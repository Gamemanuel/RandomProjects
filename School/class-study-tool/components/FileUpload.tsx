"use client";

import React, { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Question, QuestionSet } from "@/types";

interface FileUploadProps {
  onQuestionsLoaded: (questions: Question[]) => void;
}

function validateQuestions(data: unknown): data is QuestionSet {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.questions)) return false;
  return obj.questions.every((q: unknown) => {
    if (!q || typeof q !== "object") return false;
    const question = q as Record<string, unknown>;
    return (
      typeof question.id === "number" &&
      typeof question.question === "string" &&
      Array.isArray(question.options) &&
      question.options.length >= 2 &&
      question.options.length <= 6 &&
      question.options.every((o: unknown) => typeof o === "string") &&
      typeof question.correctAnswer === "number" &&
      question.correctAnswer >= 0 &&
      question.correctAnswer < (question.options as unknown[]).length
    );
  });
}

export default function FileUpload({ onQuestionsLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      setSuccess(null);

      if (!file.name.endsWith(".json")) {
        setError("Please upload a .json file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (!validateQuestions(parsed)) {
            setError(
              "Invalid file format. Please check the documentation below."
            );
            return;
          }
          if (parsed.questions.length === 0) {
            setError("The file contains no questions.");
            return;
          }
          setSuccess(`Loaded ${parsed.questions.length} questions successfully!`);
          onQuestionsLoaded(parsed.questions);
        } catch {
          setError("Could not parse JSON. Please check your file syntax.");
        }
      };
      reader.readAsText(file);
    },
    [onQuestionsLoaded]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-4 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
          ${
            isDragging
              ? "border-amber-600 bg-amber-100"
              : "border-amber-300 bg-amber-50 hover:border-amber-500 hover:bg-amber-100"
          }
        `}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center">
            <Upload className="w-8 h-8 text-amber-700" />
          </div>
          <div>
            <p className="text-lg font-semibold text-amber-900">
              Drop your JSON file here
            </p>
            <p className="text-sm text-amber-600 mt-1">
              or click to browse your files
            </p>
          </div>
          <Button variant="outline" size="sm" className="pointer-events-none">
            <FileText className="w-4 h-4 mr-2" />
            Select JSON File
          </Button>
        </div>
      </div>

      {/* Error / Success Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            File Format Documentation
          </CardTitle>
          <CardDescription>
            Your JSON file must follow this structure:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-amber-900 text-amber-100 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
{`{
  "questions": [
    {
      "id": 1,
      "question": "What is the capital of France?",
      "options": ["London", "Paris", "Berlin", "Madrid"],
      "correctAnswer": 1
    },
    {
      "id": 2,
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1
    }
  ]
}`}
          </pre>
          <div className="mt-4 space-y-2 text-sm text-amber-700">
            <p>
              <span className="font-semibold text-amber-900">id</span> — Unique number for each question
            </p>
            <p>
              <span className="font-semibold text-amber-900">question</span> — The question text
            </p>
            <p>
              <span className="font-semibold text-amber-900">options</span> — Array of 2–6 answer strings
            </p>
            <p>
              <span className="font-semibold text-amber-900">correctAnswer</span> — Zero-based index of the correct option (e.g. 0 = first option)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

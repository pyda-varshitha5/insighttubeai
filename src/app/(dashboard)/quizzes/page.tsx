"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BadgeHelp,
  CheckCircle2,
  Circle,
  Clock3,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;

  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };

  correctAnswer: "A" | "B" | "C" | "D";

  explanation: string;

  difficulty:
    | "Beginner"
    | "Intermediate"
    | "Advanced";
}

interface QuizData {
  topic: string;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const topic =
    searchParams.get("topic") ||
    "Topic";

  const [quiz, setQuiz] =
    useState<QuizData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
  const loadQuiz = () => {
    try {
      const storedQuiz = sessionStorage.getItem("generatedQuiz");

      if (!storedQuiz) {
        setError("Quiz data was not found. Please generate the quiz again.");
        setLoading(false);
        return;
      }

      const parsedQuiz = JSON.parse(storedQuiz);

      if (!parsedQuiz || !parsedQuiz.questions) {
        setError("Invalid quiz data. Please generate the quiz again.");
        setLoading(false);
        return;
      }

      setQuiz(parsedQuiz);
      setLoading(false);
    } catch (error) {
      console.error("Quiz loading error:", error);
      setError("Failed to load quiz. Please generate it again.");
      setLoading(false);
    }
  };

  const frame = requestAnimationFrame(loadQuiz);

  return () => cancelAnimationFrame(frame);
}, []);
  /* ========================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <h2 className="text-xl font-semibold text-slate-900">
            Loading your quiz...
          </h2>

        </div>

      </div>
    );
  }

  /* ========================================================
     ERROR
  ======================================================== */

  if (error || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">

            <XCircle className="h-7 w-7 text-red-500" />

          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Unable to load quiz
          </h2>

          <p className="mt-3 text-sm text-red-500">
            {error}
          </p>

          <button
            onClick={() =>
              router.back()
            }
            className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Back to Summary
          </button>

        </div>

      </div>
    );
  }

  const firstQuestion =
    quiz.questions[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="flex h-20 items-center justify-between px-6">

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-violet-600"
          >
            <ArrowLeft className="h-5 w-5" />

            Back to Summary
          </button>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 font-semibold text-white">
              V
            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* ===================================================
            TITLE
        ==================================================== */}

        <section className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">

              <BadgeHelp className="h-6 w-6 text-emerald-600" />

            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Quiz:{" "}
                <span className="text-violet-600">
                  {topic}
                </span>
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Test your understanding of the generated summary.
              </p>

            </div>

          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">

            <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">

              <Clock3 className="h-4 w-4" />

              {quiz.questions.length} Questions

            </span>

            <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">

              <Sparkles className="h-4 w-4" />

              AI Generated

            </span>

          </div>

        </section>

        {/* ===================================================
            QUESTION
        ==================================================== */}

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_280px]">

          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="mb-7 flex items-center justify-between">

              <span className="rounded-lg bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">

                Question 1 of{" "}
                {quiz.questions.length}

              </span>

              <span className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">

                {firstQuestion.difficulty}

              </span>

            </div>

            <h2 className="mb-7 text-xl font-bold leading-8">

              {firstQuestion.question}

            </h2>

            <div className="space-y-4">

              {Object.entries(
                firstQuestion.options
              ).map(
                ([letter, option]) => (
                  <button
                    key={letter}
                    type="button"
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-violet-400 hover:bg-violet-50"
                  >

                    <Circle className="h-5 w-5 shrink-0 text-slate-300" />

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 font-semibold text-violet-600">
                      {letter}
                    </span>

                    <span className="text-sm font-medium text-slate-700">
                      {option}
                    </span>

                  </button>
                )
              )}

            </div>

            <div className="mt-8 rounded-xl bg-violet-50 p-5">

              <div className="flex items-center gap-3">

                <Sparkles className="h-5 w-5 text-violet-600" />

                <h3 className="font-semibold text-violet-700">
                  Explanation
                </h3>

              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Select an answer to see the explanation.
              </p>

            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">

              <button
                disabled
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-400"
              >
                <ArrowLeft className="h-4 w-4" />

                Previous
              </button>

              <button
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Next

                <ArrowRight className="h-4 w-4" />

              </button>

            </div>

          </section>

          {/* =================================================
              PROGRESS
          ================================================== */}

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold">
              Quiz Progress
            </h2>

            <div className="my-7 flex justify-center">

              <div className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-violet-100">

                <span className="text-3xl font-bold text-violet-600">
                  0%
                </span>

              </div>

            </div>

            <p className="mb-6 text-center text-sm text-slate-500">
              0 of {quiz.questions.length} Questions
            </p>

            <div className="grid grid-cols-3 border-y border-slate-200 py-5 text-center">

              <div>

                <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />

                <p className="mt-2 text-xs text-slate-500">
                  Correct
                </p>

                <p className="font-bold">
                  0
                </p>

              </div>

              <div>

                <XCircle className="mx-auto h-5 w-5 text-red-500" />

                <p className="mt-2 text-xs text-slate-500">
                  Incorrect
                </p>

                <p className="font-bold">
                  0
                </p>

              </div>

              <div>

                <Circle className="mx-auto h-5 w-5 text-slate-400" />

                <p className="mt-2 text-xs text-slate-500">
                  Unanswered
                </p>

                <p className="font-bold">
                  {quiz.questions.length}
                </p>

              </div>

            </div>

            <h3 className="mb-4 mt-6 font-semibold">
              Questions
            </h3>

            <div className="grid grid-cols-5 gap-2">

              {quiz.questions.map(
                (question, index) => (

                  <button
                    key={question.id}
                    className={`flex h-9 items-center justify-center rounded-lg text-sm font-semibold ${
                      index === 0
                        ? "bg-violet-600 text-white"
                        : "border border-slate-200 text-slate-700"
                    }`}
                  >
                    {index + 1}
                  </button>

                )
              )}

            </div>

            <button
              type="button"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400 px-4 py-3 text-sm font-semibold text-violet-600 hover:bg-violet-50"
            >

              <Send className="h-4 w-4" />

              Submit Quiz

            </button>

          </aside>

        </div>

      </main>

    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Circle,
  Clock3,
  Send,
  Sparkles,
  Tag,
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
}

interface QuizData {
  topic: string;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const topic = searchParams.get("topic") || "Topic";
  const [quiz, setQuiz] = useState<QuizData | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
useEffect(() => {
  async function generateQuiz() {
    if (!topic || topic === "Topic") {
      setError("No quiz topic was provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      setQuiz(data);
    } catch (err: any) {
      console.error("Quiz generation error:", err);
      setError(err?.message || "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  }

  generateQuiz();
}, [topic]);

  return (
  <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-20 items-center justify-between px-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-violet-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to results
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-11 w-[360px] items-center rounded-xl border border-slate-200 bg-white px-4">
              <input
                placeholder="Search any topic..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white">
              <span className="text-lg">🔔</span>
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 font-semibold text-white">
              V
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-[240px] shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="flex h-[calc(100vh-80px)] flex-col px-5 py-7">
            <div className="mb-12 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
                <span className="text-xl text-white">▶</span>
              </div>

              <span className="text-lg font-bold">
                InsightTube<span className="text-violet-600">-AI</span>
              </span>
            </div>

            <nav className="space-y-3">
              {[
                ["⌂", "Dashboard"],
                ["⌕", "Search"],
                ["◷", "History"],
                ["♡", "Saved"],
                ["▥", "Analytics"],
                ["♙", "Profile"],
                ["⚙", "Settings"],
              ].map(([icon, label]) => (
                <button
                  key={label}
                  className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                    label === "Search"
                      ? "bg-violet-50 text-violet-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-auto rounded-2xl bg-violet-50 p-5">
              <div className="mb-3 text-3xl">💡</div>
              <p className="text-sm font-semibold text-violet-700">
                Keep learning!
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Test your knowledge and improve your understanding.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 px-6 py-8">
          {/* Quiz Heading */}
          <section className="mb-7 border-b border-slate-200 pb-7">
            <div className="flex items-center gap-6">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-900 to-violet-700 text-center text-sm font-bold text-white">
                {topic.length > 18
                  ? topic.substring(0, 18).toUpperCase()
                  : topic.toUpperCase()}
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Quiz:{" "}
                  <span className="text-violet-600">{topic}</span>
                </h1>

                <p className="mt-2 text-slate-500">
                  Test your understanding of the topic
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    10 Questions
                  </span>

                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Multiple Choice
                  </span>

                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    1 Point Each
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-7 xl:grid-cols-[1fr_310px]">
            {/* Question Area */}
            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-7 flex items-center justify-between">
                <span className="rounded-lg bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                  Question 1 of 10
                </span>

                <span className="flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                  <Sparkles className="h-4 w-4" />
                  1 Point
                </span>
              </div>

              <h2 className="mb-7 text-xl font-bold">
                What is {topic} primarily used for?
              </h2>

              {/* Options */}
              <div className="space-y-4">
                {["Understanding core concepts", "Creating visual designs", "Managing databases", "Writing operating systems"].map(
                  (option, index) => {
                    const letter = String.fromCharCode(65 + index);

                    return (
                      <button
                        key={letter}
                        className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-violet-400 hover:bg-violet-50"
                      >
                        <Circle className="h-5 w-5 text-slate-300" />

                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 font-semibold text-violet-600">
                          {letter}
                        </span>

                        <span className="text-sm font-medium text-slate-700">
                          {option}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              {/* Explanation */}
              <div className="mt-7 rounded-xl bg-violet-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                  </div>

                  <h3 className="font-semibold text-violet-700">
                    Explanation
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The explanation for the selected answer will appear here
                  after answering the question.
                </p>
              </div>

              {/* Bottom Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
                <button
                  disabled
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                <button className="flex items-center gap-2 text-sm font-semibold text-violet-600">
                  <Bookmark className="h-4 w-4" />
                  Mark for Review
                </button>

                <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>

            {/* Right Progress Panel */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Quiz Progress</h2>

              {/* Progress Circle */}
              <div className="my-7 flex justify-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-violet-100">
                  <span className="text-3xl font-bold text-violet-600">
                    0%
                  </span>
                </div>
              </div>

              <p className="mb-6 text-center text-sm text-slate-500">
                0 of 10 Questions
              </p>

              <div className="grid grid-cols-3 border-y border-slate-200 py-5 text-center">
                <div>
                  <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
                  <p className="mt-2 text-xs text-slate-500">Correct</p>
                  <p className="font-bold">0</p>
                </div>

                <div>
                  <XCircle className="mx-auto h-5 w-5 text-red-500" />
                  <p className="mt-2 text-xs text-slate-500">Incorrect</p>
                  <p className="font-bold">0</p>
                </div>

                <div>
                  <Circle className="mx-auto h-5 w-5 text-slate-400" />
                  <p className="mt-2 text-xs text-slate-500">Unanswered</p>
                  <p className="font-bold">10</p>
                </div>
              </div>

              <h3 className="mb-4 mt-6 font-semibold">Questions</h3>

              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, index) => (
                  <button
                    key={index}
                    className={`flex h-9 items-center justify-center rounded-lg text-sm font-semibold ${
                      index === 0
                        ? "bg-violet-600 text-white"
                        : "border border-slate-200 text-slate-700 hover:border-violet-400"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400 px-4 py-3 text-sm font-semibold text-violet-600 transition hover:bg-violet-50">
                <Send className="h-4 w-4" />
                Submit Quiz
              </button>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
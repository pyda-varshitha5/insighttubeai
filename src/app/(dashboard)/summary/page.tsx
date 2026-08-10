"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import ReadingProgress from "@/components/summary/ReadingProgress";
import SummaryActions from "@/components/summary/SummaryActions";
import { useAuth } from "@/context/AuthProvider";
import MarkdownRenderer from "@/components/summary/MarkdownRenderer";
import InterviewAccordion from "@/components/summary/InterviewAccordion";

import {
  extractHeadings,
  parseInterviewQuestions,
  stripInterviewSection,
} from "@/lib/markdown";

import {
  ArrowLeft,
  BadgeHelp,
  Sparkles,
} from "lucide-react";

interface SummaryResponse {
  title: string;
  subtitle: string;
  difficulty:
    | "Beginner"
    | "Intermediate"
    | "Advanced";
  lastUpdated: string;
  readingTime: number;
  markdown: string;
}

type FetchState =
  | {
      status: "loading";
    }
  | {
      status: "success";
      data: SummaryResponse;
    }
  | {
      status: "error";
      message: string;
    };

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner:
    "bg-emerald-50 text-emerald-700 border-emerald-200",

  Intermediate:
    "bg-amber-50 text-amber-700 border-amber-200",

  Advanced:
    "bg-rose-50 text-rose-700 border-rose-200",
};

/* =========================================================
   LOADING UI
========================================================= */

function LoadingDoc() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <div className="mb-4 h-10 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="mb-10 flex gap-3">
          <div className="h-8 w-24 animate-pulse rounded-full bg-gray-100" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-gray-100" />
          <div className="h-8 w-32 animate-pulse rounded-full bg-gray-100" />
        </div>

        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse"
            >
              <div className="mb-4 h-6 w-56 rounded bg-gray-100" />

              <div className="space-y-2.5">
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-3 w-11/12 rounded bg-gray-100" />
                <div className="h-3 w-4/5 rounded bg-gray-100" />
                <div className="h-3 w-3/4 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ERROR UI
========================================================= */

function ErrorDoc({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <span className="text-xl">!</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900">
          Could not generate this guide
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          Retry
        </button>
      </div>

    </div>
  );
}

/* =========================================================
   SUMMARY PAGE
========================================================= */

export default function SummaryPage() {
  const router = useRouter();

  const { user } = useAuth();

  const searchParams = useSearchParams();

  const topic =
    searchParams.get("topic") ??
    searchParams.get("q") ??
    "";

  const [state, setState] = useState<FetchState>({
    status: "loading",
  });

  const [quizLoading, setQuizLoading] = useState(false);

  const [quizError, setQuizError] = useState("");

  /* =======================================================
     LOAD SUMMARY
  ======================================================= */

  const loadSummary = useCallback(
    async () => {
      if (!topic) {
        setState({
          status: "error",
          message: "No topic was provided.",
        });

        return;
      }

      setState({
        status: "loading",
      });

      try {
        const response = await fetch(
          "/api/summary",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              topic,
              userId: user?.uid,
            }),
          }
        );

      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => null);

        throw new Error(
          payload?.error ??
            "Failed to generate documentation."
        );
      }

      const data =
        (await response.json()) as SummaryResponse;

      setState({
        status: "success",
        data,
      });

      window.dispatchEvent(
        new Event("progress-updated")
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unexpected error occurred.";

        setState({
          status: "error",
          message,
        });
      }
    },
    [topic, user]
  );

useEffect(() => {
  const timer = setTimeout(() => {
    loadSummary();
  }, 0);

  return () => {
    clearTimeout(timer);
  };
}, [loadSummary]);
  /* =======================================================
     MARKDOWN
  ======================================================= */

  const bodyWithoutInterview = useMemo(() => {
    if (state.status !== "success") {
      return "";
    }

    return stripInterviewSection(
      state.data.markdown
    );
  }, [state]);

  const interviewItems = useMemo(() => {
    if (state.status !== "success") {
      return [];
    }

    return parseInterviewQuestions(
      state.data.markdown
    );
  }, [state]);

  const headings = useMemo(() => {
    if (state.status !== "success") {
      return [];
    }

    const baseHeadings =
      extractHeadings(bodyWithoutInterview);

    if (interviewItems.length > 0) {
      return [
        ...baseHeadings,
        {
          id: "interview-questions",
          text: "Interview Questions",
          level: 2 as const,
        },
      ];
    }

    return baseHeadings;
  }, [
    state,
    bodyWithoutInterview,
    interviewItems,
  ]);

  /* =======================================================
     SAVE SUMMARY
  ======================================================= */

  const handleSave = async () => {
    if (state.status !== "success") {
      return;
    }

    if (!user) {
      alert("Please login first");
      return;
    }

    const data = state.data;

    try {
      // Get Firebase authentication token
      const token = await user.getIdToken();

      const response = await fetch("/api/saved", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          userId: user.uid,
          title: data.title,
          markdown: data.markdown,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        console.error(
          "Save summary error:",
          result
        );

        alert(
          result?.error ||
            "Failed to save summary"
        );

        return;
      }

      console.log(
        "Summary saved successfully:",
        result
      );

      // Refresh dashboard / analytics statistics
      window.dispatchEvent(
        new Event("progress-updated")
      );

      alert("Summary saved successfully!");
    } catch (error) {
      console.error(
        "Failed to save summary:",
        error
      );

      alert("Failed to save summary");
    }
  };

  /* =======================================================
     BACK TO SEARCH
  ======================================================= */

  const goBack = () => {
    router.push(
      `/search?topic=${encodeURIComponent(
        topic
      )}&results=true`
    );
  };

  /* =======================================================
     GENERATE PPT
  ======================================================= */

  const handleGeneratePpt = async () => {
    if (state.status !== "success") {
      return;
    }

    const data = state.data;

    try {
      console.log(
        "Generating AI Presentation..."
      );

      const response = await fetch(
        "/api/ppt",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: data.title,
            markdown: data.markdown,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to generate presentation"
        );
      }

      const presentation =
        await response.json();

      console.log(
        "Presentation:",
        presentation
      );

      sessionStorage.setItem(
        "generatedPresentation",
        JSON.stringify(presentation)
      );

      router.push("/presentation");
    } catch (error) {
      console.error(error);

      alert(
        "Failed to generate presentation."
      );
    }
  };

  /* =======================================================
     GENERATE QUIZ
  ======================================================= */

  const handleGenerateQuiz = async () => {
    /*
     * Make sure the summary has loaded successfully.
     */
    if (state.status !== "success") {
      return;
    }

    const data = state.data;

    try {
      setQuizLoading(true);
      setQuizError("");

      console.log(
        "================================="
      );

      console.log(
        "GENERATING QUIZ"
      );

      console.log(
        "TOPIC:",
        topic
      );

      console.log(
        "================================="
      );

      /*
       * Send the generated summary to the
       * quiz API.
       */
      const response = await fetch(
        "/api/quiz/generate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            topic,
            summary: data.markdown,
          }),
        }
      );

      /*
       * Safely parse the response.
       */
      const result =
        await response.json().catch(() => null);

      console.log(
        "================================="
      );

      console.log(
        "QUIZ API RESPONSE:",
        result
      );

      console.log(
        "QUIZ API STATUS:",
        response.status
      );

      console.log(
        "================================="
      );

      /*
       * Handle API errors.
       */
      if (!response.ok) {
        throw new Error(
          result?.error ??
            result?.message ??
            "Failed to generate quiz."
        );
      }

      /*
       * The API may return any of these:
       *
       * {
       *   questions: [...]
       * }
       *
       * OR
       *
       * {
       *   quiz: {
       *     questions: [...]
       *   }
       * }
       *
       * OR
       *
       * {
       *   data: {
       *     questions: [...]
       *   }
       * }
       *
       * Normalize all of them.
       */
      const quizData =
        result?.quiz ??
        result?.data ??
        result;

      console.log(
        "NORMALIZED QUIZ DATA:",
        quizData
      );

      /*
       * Make sure questions exist.
       */
      if (
        !quizData ||
        !Array.isArray(
          quizData.questions
        ) ||
        quizData.questions.length === 0
      ) {
        console.error(
          "Invalid quiz response:",
          result
        );

        throw new Error(
          "Quiz was generated, but no questions were returned."
        );
      }

      /*
       * Create the exact object that
       * the quiz page will receive.
       */
      const finalQuiz = {
        topic:
          quizData.topic ??
          topic,

        questions:
          quizData.questions,
      };

      console.log(
        "FINAL QUIZ DATA:",
        finalQuiz
      );

      /*
       * Save generated quiz in sessionStorage.
       */
      sessionStorage.setItem(
        "generatedQuiz",
        JSON.stringify(finalQuiz)
      );

      /*
       * Save topic separately as well.
       */
      sessionStorage.setItem(
        "quizTopic",
        topic
      );

      console.log(
        "Quiz saved successfully."
      );

      /*
       * Navigate to quiz page.
       */
      router.push(
        `/quizzes?topic=${encodeURIComponent(
          topic
        )}`
      );
    } catch (error) {
      console.error(
        "Quiz generation error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate quiz.";

      setQuizError(message);

      alert(message);
    } finally {
      setQuizLoading(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (state.status === "loading") {
    return <LoadingDoc />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (state.status === "error") {
    return (
      <ErrorDoc
        message={state.message}
        onRetry={loadSummary}
      />
    );
  }

  /*
   * At this point TypeScript knows that state is success.
   */
  const { data } = state;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />

      {/* =================================================
          ACTIONS
      ================================================== */}

      <div className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-purple-600"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Results
          </button>

          <SummaryActions
            markdown={data.markdown}
            title={data.title}
            onSave={handleSave}
            onGeneratePpt={
              handleGeneratePpt
            }
          />
        </div>

      </div>

      {/* =================================================
          MAIN CONTENT
      ================================================== */}

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_240px]">

        {/* =================================================
            DOCUMENT
        ================================================== */}

        <main>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">
            {data.title}
          </h1>

          <p className="mb-4 text-sm text-gray-400">
            {data.subtitle}
          </p>

          <div className="mb-10 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span
              className={`rounded-full border px-2.5 py-1 font-medium ${
                DIFFICULTY_STYLES[
                  data.difficulty
                ]
              }`}
            >
              {data.difficulty}
            </span>

            <span className="rounded-full border border-gray-200 px-2.5 py-1">
              {data.readingTime} min read
            </span>

            <span className="rounded-full border border-gray-200 px-2.5 py-1">
              Updated {data.lastUpdated}
            </span>
          </div>

          <MarkdownRenderer
            markdown={bodyWithoutInterview}
          />

          {/* =================================================
              INTERVIEW QUESTIONS
          ================================================== */}

          {interviewItems.length > 0 && (
            <section>
              <h2
                id="interview-questions"
                className="mt-14 mb-4 scroll-mt-24 border-b border-gray-100 pb-3 text-2xl font-bold tracking-tight text-gray-900"
              >
                Interview Questions
              </h2>

              <InterviewAccordion
                items={interviewItems}
              />
            </section>
          )}
        </main>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================== */}

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">

            {/* =================================================
                TABLE OF CONTENTS
            ================================================== */}

            {headings.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  On this page
                </h3>

                <div className="space-y-2">
                  {headings.map(
                    (heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className="block text-xs leading-5 text-gray-500 transition hover:text-purple-600"
                      >
                        {heading.text}
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                QUIZ CARD
            ================================================== */}

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                <BadgeHelp className="h-5 w-5 text-emerald-600" />
              </div>

              <h3 className="text-sm font-bold text-gray-900">
                Test your understanding
              </h3>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Take a quiz based on this generated summary.
              </p>

              {quizError && (
                <p className="mt-3 text-xs text-red-500">
                  {quizError}
                </p>
              )}

              <button
                type="button"
                onClick={handleGenerateQuiz}
                disabled={quizLoading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {quizLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </button>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
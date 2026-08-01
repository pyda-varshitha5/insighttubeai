"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReadingProgress from "@/components/summary/ReadingProgress";
import SummaryActions from "@/components/summary/SummaryActions";

import MarkdownRenderer from "@/components/summary/MarkdownRenderer";
import InterviewAccordion from "@/components/summary/InterviewAccordion";
import {
  extractHeadings,
  parseInterviewQuestions,
  stripInterviewSection,
} from "@/lib/markdown";

interface SummaryResponse {
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lastUpdated: string;
  readingTime: number;
  markdown: string;
}

type FetchState =
  | { status: "loading" }
  | { status: "success"; data: SummaryResponse }
  | { status: "error"; message: string };

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  Advanced: "bg-rose-50 text-rose-700 border-rose-200",
};

function LoadingDoc() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-10 flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />
        </div>
        <p className="text-[15px] font-medium text-gray-700">Generating documentation…</p>
        <p className="text-sm text-gray-400">Building a complete study guide for this topic</p>
      </div>

      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
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
  );
}

function ErrorDoc({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-rose-100 bg-rose-50/60 p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
          <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Couldn&apos;t generate this guide</h2>
        <p className="mb-6 text-sm text-gray-500">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? searchParams.get("q") ?? "";

  const [state, setState] = useState<FetchState>({ status: "loading" });

  const loadSummary = useCallback(async () => {
    if (!topic) {
      setState({ status: "error", message: "No topic was provided." });
      return;
    }

    setState({ status: "loading" });

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to generate documentation.");
      }

      const data = (await response.json()) as SummaryResponse;
      setState({ status: "success", data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error occurred.";
      setState({ status: "error", message });
    }
  }, [topic]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const bodyWithoutInterview = useMemo(() => {
    if (state.status !== "success") return "";
    return stripInterviewSection(state.data.markdown);
  }, [state]);

  const interviewItems = useMemo(() => {
    if (state.status !== "success") return [];
    return parseInterviewQuestions(state.data.markdown);
  }, [state]);

  const headings = useMemo(() => {
    if (state.status !== "success") return [];
    const baseHeadings = extractHeadings(bodyWithoutInterview);
    if (interviewItems.length > 0) {
      return [...baseHeadings, { id: "interview-questions", text: "Interview Questions", level: 2 as const }];
    }
    return baseHeadings;
  }, [state, bodyWithoutInterview, interviewItems]);

const goBack = () => {
  router.push(
    `/search?topic=${encodeURIComponent(topic)}&results=true`
  );
};

  if (state.status === "loading") {
    return <LoadingDoc />;
  }

  if (state.status === "error") {
    return <ErrorDoc message={state.message} onRetry={loadSummary} />;
  }

  const { data } = state;

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />

      <div className="pl-1 sm:pl-2">
        <SummaryActions markdown={data.markdown} title={data.title} />

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <main className="min-w-0">
            <button
  type="button"
  onClick={goBack}
  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-purple-600"
>
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>

  Back to Results
</button>

            <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">{data.title}</h1>
            <p className="mb-4 text-sm text-gray-400">{data.subtitle}</p>

            <div className="mb-10 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span
                className={`rounded-full border px-2.5 py-1 font-medium ${DIFFICULTY_STYLES[data.difficulty]}`}
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

            <MarkdownRenderer markdown={bodyWithoutInterview} />

            {interviewItems.length > 0 && (
              <section>
                <h2
                  id="interview-questions"
                  className="mt-14 mb-4 scroll-mt-24 border-b border-gray-100 pb-3 text-2xl font-bold tracking-tight text-gray-900"
                >
                  Interview Questions
                </h2>
                <InterviewAccordion items={interviewItems} />
              </section>
            )}
          </main>

          <aside className="hidden lg:block">
            
          </aside>
        </div>
      </div>
    </div>
  );
}
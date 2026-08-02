"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MarkdownRenderer from "@/components/summary/MarkdownRenderer";
import InterviewAccordion from "@/components/summary/InterviewAccordion";
import {
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

export default function PrintSummaryPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "";

  const [data, setData] = useState<SummaryResponse | null>(null);

  useEffect(() => {
    async function loadSummary() {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      const summary = await res.json();
      setData(summary);
    }

    if (topic) {
      loadSummary();
    }
  }, [topic]);

  useEffect(() => {
    if (!data) return;

    const timer = setTimeout(() => {
      window.print();
    }, 800);

    return () => clearTimeout(timer);
  }, [data]);

  if (!data) {
    return (
      <div className="p-10 text-lg">
        Loading...
      </div>
    );
  }

  const body = stripInterviewSection(data.markdown);
  const interview = parseInterviewQuestions(data.markdown);

  return (
    <main className="mx-auto max-w-5xl bg-white px-10 py-10">
      <h1 className="mb-2 text-4xl font-bold">
        {data.title}
      </h1>

      <p className="mb-6 text-gray-500">
        {data.subtitle}
      </p>

      <MarkdownRenderer markdown={body} />

      {interview.length > 0 && (
        <>
          <h2 className="mt-12 mb-4 text-3xl font-bold">
            Interview Questions
          </h2>

          <InterviewAccordion items={interview} />
        </>
      )}
    </main>
  );
}
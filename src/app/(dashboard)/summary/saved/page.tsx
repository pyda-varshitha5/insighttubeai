"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MarkdownRenderer from "@/components/summary/MarkdownRenderer";
import SummaryActions from "@/components/summary/SummaryActions";
import ReadingProgress from "@/components/summary/ReadingProgress";

interface SavedSummary {
  _id: string;
  title: string;
  markdown: string;
  createdAt: string;
}

export default function SavedSummaryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");

  const [summary, setSummary] = useState<SavedSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/saved/${id}`);

        if (!res.ok) return;

        const data = await res.json();

        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        Loading...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex justify-center py-20">
        Summary not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />

      <SummaryActions
        title={summary.title}
        markdown={summary.markdown}
      />

      <div className="mx-auto max-w-5xl px-6 py-8">

        <button
          onClick={() => router.push("/saved")}
          className="mb-6 text-sm text-violet-600 hover:underline"
        >
          ← Back to Saved
        </button>

        <h1 className="mb-6 text-4xl font-bold">
          {summary.title}
        </h1>

        <MarkdownRenderer markdown={summary.markdown} />

      </div>
    </div>
  );
}
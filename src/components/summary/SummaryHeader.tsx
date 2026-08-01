"use client";

import { useRouter } from "next/navigation";

interface SummaryHeaderProps {
  topic: string;
}

export default function SummaryHeader({ topic }: SummaryHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-purple-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Results
      </button>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        AI Summary
      </h1>
      <p className="mt-2 text-lg text-purple-600">{topic}</p>
    </div>
  );
}
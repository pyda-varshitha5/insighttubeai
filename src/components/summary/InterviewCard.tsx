"use client";

import { useState } from "react";
import { InterviewQuestion } from "@/types/summary";

interface InterviewCardProps {
  item: InterviewQuestion;
  index: number;
}

export default function InterviewCard({ item, index }: InterviewCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 bg-white px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
            {index + 1}
          </span>
          <span className="text-[15px] font-medium text-gray-900">{item.question}</span>
        </div>
        <svg
          className={`mt-1 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 pl-14">
          <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
        </div>
      )}
    </div>
  );
}
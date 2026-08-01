"use client";

import { useState } from "react";
import { InterviewItem } from "@/lib/markdown";

interface InterviewAccordionProps {
  items: InterviewItem[];
}

const LEVEL_ORDER: InterviewItem["level"][] = ["Beginner", "Intermediate", "Advanced", "General"];

const LEVEL_STYLES: Record<InterviewItem["level"], string> = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  Advanced: "bg-rose-50 text-rose-700 border-rose-200",
  General: "bg-gray-50 text-gray-600 border-gray-200",
};

function AccordionRow({ item, index }: { item: InterviewItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
        aria-expanded={open}
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex-shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${LEVEL_STYLES[item.level]}`}
          >
            {item.level}
          </span>
          <span className="text-[15px] font-medium leading-snug text-gray-900">
            {index + 1}. {item.question}
          </span>
        </div>
        <svg
          className={`mt-1 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function InterviewAccordion({ items }: InterviewAccordionProps) {
  const [activeLevel, setActiveLevel] = useState<InterviewItem["level"] | "All">("All");

  if (items.length === 0) {
    return <p className="text-sm text-gray-400">No interview questions available.</p>;
  }

  const levelsPresent = LEVEL_ORDER.filter((level) => items.some((item) => item.level === level));
  const filtered = activeLevel === "All" ? items : items.filter((item) => item.level === activeLevel);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveLevel("All")}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            activeLevel === "All"
              ? "border-purple-600 bg-purple-600 text-white"
              : "border-gray-200 text-gray-600 hover:border-purple-200 hover:text-purple-700"
          }`}
        >
          All ({items.length})
        </button>
        {levelsPresent.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setActiveLevel(level)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeLevel === level
                ? "border-purple-600 bg-purple-600 text-white"
                : "border-gray-200 text-gray-600 hover:border-purple-200 hover:text-purple-700"
            }`}
          >
            {level} ({items.filter((item) => item.level === level).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item, index) => (
          <AccordionRow key={`${item.question}-${index}`} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
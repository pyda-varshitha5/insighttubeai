// src/components/search/SuggestedSearches.tsx
"use client";

import { Search } from "lucide-react";

interface SuggestedSearchesProps {
  onSelect: (term: string) => void;
  items?: string[];
}

const DEFAULT_SUGGESTED_SEARCHES: string[] = [
  "How does Blockchain work?",
  "Explain HTTP vs HTTPS",
  "Next.js 14 Crash Course",
  "What is Generative AI?",
  "SQL Tutorial for Beginners",
];

export default function SuggestedSearches({
  onSelect,
  items = DEFAULT_SUGGESTED_SEARCHES,
}: SuggestedSearchesProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        You can try
      </h3>

      <div className="flex flex-col divide-y divide-gray-100">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="flex items-center gap-3 py-3 text-left transition hover:bg-gray-50"
          >
            <Search className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-gray-800">{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
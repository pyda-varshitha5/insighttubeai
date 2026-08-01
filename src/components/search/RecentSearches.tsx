// src/components/search/RecentSearches.tsx
"use client";

import { Clock } from "lucide-react";

interface RecentSearchItem {
  title: string;
  timeAgo: string;
}

interface RecentSearchesProps {
  onSelect: (term: string) => void;
  items?: RecentSearchItem[];
}

const DEFAULT_RECENT_SEARCHES: RecentSearchItem[] = [
  { title: "React Hooks Tutorial", timeAgo: "2 hours ago" },
  { title: "JavaScript Full Course", timeAgo: "1 day ago" },
  { title: "Machine Learning Basics", timeAgo: "2 days ago" },
  { title: "System Design Interview", timeAgo: "3 days ago" },
  { title: "Python for Beginners", timeAgo: "4 days ago" },
];

export default function RecentSearches({
  onSelect,
  items = DEFAULT_RECENT_SEARCHES,
}: RecentSearchesProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Recent Searches
        </h3>
        <button
          type="button"
          className="text-sm font-medium text-purple-600 hover:text-purple-700"
        >
          View all
        </button>
      </div>

      <div className="flex flex-col divide-y divide-gray-100">
        {items.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onSelect(item.title)}
            className="flex items-center justify-between py-3 text-left transition hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-800">{item.title}</span>
            </div>
            <span className="text-xs text-gray-400">{item.timeAgo}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
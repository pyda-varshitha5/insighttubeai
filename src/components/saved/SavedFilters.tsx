"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const TABS = [
  { label: "All", count: 16 },
  { label: "Summaries", count: 14 },
  { label: "Searches", count: 2 },
];

export default function SavedFilters() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      {/* Pill tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActiveTab(index)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              index === activeTab
                ? "bg-violet-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-600"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-violet-50 hover:text-violet-600"
        >
          <span>Recently Saved</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
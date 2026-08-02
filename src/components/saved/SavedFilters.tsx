"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  total: number;
}

export default function SavedFilters({ total }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [savedCount, setSavedCount] = useState(total);

  useEffect(() => {
    setSavedCount(total);
  }, [total]);

  const TABS = [
    {
      label: "All",
      count: savedCount,
    },
    {
      label: "Summaries",
      count: savedCount,
    },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(index)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeTab === index
                ? "bg-violet-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-600"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-600">
        Recently Saved
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
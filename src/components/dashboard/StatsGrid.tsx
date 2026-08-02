import React from "react";
import { Play, FileText, Clock, Bookmark } from "lucide-react";

interface StatsGridProps {
  totalSearches: number;
  totalSummaries: number;
  savedSummaries: number;
  timeSavedMinutes: number;
}

export default function StatsGrid({
  totalSearches,
  totalSummaries,
  savedSummaries,
  timeSavedMinutes,
}: StatsGridProps) {
  const STATS = [
    {
      label: "Topics Explored",
      value: totalSearches,
      sub: "Total",
      icon: Play,
    },
    {
      label: "Summaries Generated",
      value: totalSummaries,
      sub: "Total",
      icon: FileText,
    },
    {
      label: "Time Saved",
      value: (timeSavedMinutes / 60).toFixed(1),
      sub: "Hours",
      icon: Clock,
    },
    {
      label: "Saved Items",
      value: savedSummaries,
      sub: "Total",
      icon: Bookmark,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map(({ label, value, sub, icon: Icon }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-violet-500" />
          </div>

          <div>
            <p className="text-xs text-slate-500">{label}</p>

            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {value}
            </p>

            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
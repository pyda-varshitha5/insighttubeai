import React from "react";
import { Play, FileText, Clock, Bookmark } from "lucide-react";

const STATS = [
  {
    label: "Topics Explored",
    value: "24",
    sub: "This Month",
    icon: Play,
  },
  {
    label: "Summaries Generated",
    value: "58",
    sub: "This Month",
    icon: FileText,
  },
  {
    label: "Time Saved",
    value: "12.6",
    sub: "Hours",
    icon: Clock,
  },
  {
    label: "Saved Items",
    value: "16",
    sub: "Total",
    icon: Bookmark,
  },
];

export default function StatsGrid() {
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
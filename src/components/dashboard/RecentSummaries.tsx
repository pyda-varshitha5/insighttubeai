"use client";

import { Bookmark } from "lucide-react";

const RECENT_SUMMARIES = [
  {
    title: "React Hooks Tutorial – Full Course for Beginners",
    date: "May 28, 2025",
    readTime: "8 min read",
    thumbColor: "bg-violet-100",
    emoji: "⚛️",
  },
  {
    title: "Python Full Course – Learn Python in 4 Hours",
    date: "May 26, 2025",
    readTime: "10 min read",
    thumbColor: "bg-sky-100",
    emoji: "🐍",
  },
  {
    title: "JavaScript Crash Course For Beginners",
    date: "May 24, 2025",
    readTime: "7 min read",
    thumbColor: "bg-amber-100",
    emoji: "JS",
  },
  {
    title: "What is Artificial Intelligence? | Full Explanation",
    date: "May 22, 2025",
    readTime: "6 min read",
    thumbColor: "bg-indigo-100",
    emoji: "🤖",
  },
];

export default function RecentSummaries() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-900">
          Recent Summaries
        </h2>

        <button className="text-xs font-medium text-violet-500 hover:text-violet-600">
          View All
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {RECENT_SUMMARIES.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 py-3"
          >
            <div
              className={`w-11 h-11 rounded-lg ${item.thumbColor} flex items-center justify-center text-sm font-semibold`}
            >
              {item.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {item.title}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {item.date} · {item.readTime}
              </p>
            </div>

            <button className="text-slate-300 hover:text-violet-500">
              <Bookmark size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
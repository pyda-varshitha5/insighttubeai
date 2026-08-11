"use client";

import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

const RECENT_SUMMARIES = [
  {
    title: "React Hooks Tutorial – Full Course for Beginners",
    date: "May 28, 2025",
    readTime: "8 min read",
    thumbColor: "bg-violet-100",
    emoji: "⚛️",
    topic: "React Hooks",
  },
  {
    title: "Python Full Course – Learn Python in 4 Hours",
    date: "May 26, 2025",
    readTime: "10 min read",
    thumbColor: "bg-sky-100",
    emoji: "🐍",
    topic: "Python",
  },
  {
    title: "JavaScript Crash Course For Beginners",
    date: "May 24, 2025",
    readTime: "7 min read",
    thumbColor: "bg-amber-100",
    emoji: "JS",
    topic: "JavaScript",
  },
  {
    title: "What is Artificial Intelligence? | Full Explanation",
    date: "May 22, 2025",
    readTime: "6 min read",
    thumbColor: "bg-indigo-100",
    emoji: "🤖",
    topic: "Artificial Intelligence",
  },
];

export default function RecentSummaries() {
  const router = useRouter();

  const openSummary = (topic: string) => {
    router.push(
      `/summary?topic=${encodeURIComponent(topic)}`
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-900">
          Popular Summaries
        </h2>

        <button
          type="button"
          onClick={() => router.push("/saved")}
          className="text-xs font-medium text-violet-500 hover:text-violet-600"
        >
          View All
        </button>
      </div>

      {/* SUMMARIES */}
      <div className="divide-y divide-slate-100">
        {RECENT_SUMMARIES.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 py-3"
          >
            {/* CLICKABLE SUMMARY AREA */}
            <button
              type="button"
              onClick={() => openSummary(item.topic)}
              className="flex flex-1 min-w-0 items-center gap-3 text-left rounded-xl transition hover:bg-violet-50/60 px-2 py-2 -mx-2"
            >
              {/* THUMBNAIL */}
              <div
                className={`w-11 h-11 rounded-lg ${item.thumbColor} flex items-center justify-center text-sm font-semibold shrink-0`}
              >
                {item.emoji}
              </div>

              {/* DETAILS */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {item.title}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {item.date} · {item.readTime}
                </p>
              </div>
            </button>

            {/* BOOKMARK */}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="shrink-0 text-slate-300 hover:text-violet-500 transition"
              aria-label="Bookmark summary"
            >
              <Bookmark size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import React from "react";
import {
  Play,
  FileText,
  Bookmark,
  Trophy,
} from "lucide-react";

interface StatsGridProps {
  totalSearches: number;
  totalSummaries: number;
  savedSummaries: number;
  quizzesCompleted: number;
}

export default function StatsGrid({
  totalSearches,
  totalSummaries,
  savedSummaries,
  quizzesCompleted,
}: StatsGridProps) {
  const stats = [
    {
      title: "Topics Explored",
      value: totalSearches,
      subtitle: "Total",
      icon: Play,
    },
    {
      title: "Summaries Generated",
      value: totalSummaries,
      subtitle: "Total",
      icon: FileText,
    },
    {
      title: "Quizzes Completed",
      value: quizzesCompleted,
      subtitle: "Total",
      icon: Trophy,
    },
    {
      title: "Saved Items",
      value: savedSummaries,
      subtitle: "Total",
      icon: Bookmark,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <Icon
                  size={22}
                  className="text-purple-600"
                />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  {stat.title}
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <p className="text-xs text-slate-400">
                  {stat.subtitle}
                </p>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
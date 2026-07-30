"use client";

import { Search, Sparkles } from "lucide-react";

export default function QuickSearch() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-violet-500" />

        <h2 className="font-semibold text-slate-900">
          Quick Search
        </h2>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Find any topic and generate AI-powered summaries.
      </p>

      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Ex: Machine Learning, React, DBMS..."
          className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />

        <button
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-violet-500 hover:bg-violet-600 text-white flex items-center justify-center"
        >
          <Search size={13} />
        </button>
      </div>
    </div>
  );
}
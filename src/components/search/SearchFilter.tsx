"use client";

import { Filter, ChevronDown } from "lucide-react";

export default function SearchFilter() {
  return (
    <div className="flex justify-end">
      <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50">
        <Filter size={18} className="text-violet-600" />

        <span>Filter</span>

        <ChevronDown size={16} className="text-slate-500" />
      </button>
    </div>
  );
}
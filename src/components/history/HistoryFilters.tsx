import { Calendar, ChevronDown, Trash2 } from "lucide-react";

const TABS = ["All", "Summaries", "Searches"];

export default function HistoryFilters() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      {/* Pill tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              index === 0
                ? "bg-violet-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right side controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Time filter dropdown */}
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-all duration-200 hover:bg-violet-50 hover:text-violet-600"
        >
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>All Time</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {/* Clear history */}
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4 text-slate-400" />
          <span>Clear History</span>
        </button>
      </div>
    </div>
  );
}
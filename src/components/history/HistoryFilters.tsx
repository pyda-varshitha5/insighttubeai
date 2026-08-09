"use client";

import {
  Calendar,
  ChevronDown,
  Trash2,
} from "lucide-react";

export type HistoryTab =
  | "All"
  | "Summaries"
  | "Searches";

export type DateFilter =
  | "All Time"
  | "Today"
  | "This Week"
  | "This Month"
  | "Last 7 Days"
  | "Last 30 Days";

interface HistoryFiltersProps {
  activeTab: HistoryTab;
  onTabChange: (tab: HistoryTab) => void;

  dateFilter: DateFilter;
  onDateChange: (date: DateFilter) => void;

  onClearHistory: () => void;
}

const TABS: HistoryTab[] = [
  "All",
  "Summaries",
  "Searches",
];

const DATE_OPTIONS: DateFilter[] = [
  "All Time",
  "Today",
  "This Week",
  "This Month",
  "Last 7 Days",
  "Last 30 Days",
];

export default function HistoryFilters({
  activeTab,
  onTabChange,
  dateFilter,
  onDateChange,
  onClearHistory,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      
      {/* ========================= */}
      {/* LEFT SIDE - TABS */}
      {/* ========================= */}

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const active = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-600"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ========================= */}
      {/* RIGHT SIDE - CONTROLS */}
      {/* ========================= */}

      <div className="flex flex-wrap items-center gap-3">

        {/* ========================= */}
        {/* DATE FILTER */}
        {/* ========================= */}

        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <select
            value={dateFilter}
            onChange={(e) =>
              onDateChange(
                e.target.value as DateFilter
              )
            }
            className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-700 outline-none transition-all hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            {DATE_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        {/* ========================= */}
        {/* CLEAR HISTORY */}
        {/* ========================= */}

        <button
          type="button"
          onClick={onClearHistory}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />

          <span>
            Clear History
          </span>
        </button>
      </div>
    </div>
  );
}
"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HistoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (
    page: number
  ) => void;
}

export default function HistoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: HistoryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages: (
    number | string
  )[] = [];

  if (totalPages <= 5) {
    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(
      2,
      currentPage - 1
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (
      currentPage <
      totalPages - 2
    ) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {/* PREVIOUS */}

      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() =>
          onPageChange(
            currentPage - 1
          )
        }
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* PAGE NUMBERS */}

      {pages.map(
        (page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="px-1 text-sm text-slate-400"
              >
                ...
              </span>
            );
          }

          const isActive =
            page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() =>
                onPageChange(
                  page as number
                )
              }
              className={`flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-xl px-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
              }`}
            >
              {page}
            </button>
          );
        }
      )}

      {/* NEXT */}

      <button
        type="button"
        disabled={
          currentPage ===
          totalPages
        }
        onClick={() =>
          onPageChange(
            currentPage + 1
          )
        }
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
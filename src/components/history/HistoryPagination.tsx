import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGES = [1, 2, 3, "...", 8];

export default function HistoryPagination() {
  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous button */}
      <button
        type="button"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:bg-violet-50 hover:text-violet-600"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {PAGES.map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
              page === 1
                ? "bg-violet-600 text-white"
                : "bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-600"
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next button */}
      <button
        type="button"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:bg-violet-50 hover:text-violet-600"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
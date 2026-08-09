"use client";

import { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  FileText,
  Search,
  ExternalLink,
  Loader2,
  
X,
} from "lucide-react";

export interface HistoryRow {
  id: string | number;
  title: string;
  description: string;
  type: "Summary" | "Search";
  date: string;
  time: string;
  createdAt?: string;
  iconBg: string;
  iconText: string;
}

interface HistoryTableProps {
  rows: HistoryRow[];

  onSave: (row: HistoryRow) => Promise<void>;
  onDelete: (row: HistoryRow) => Promise<void>;
  onOpen: (row: HistoryRow) => void;

  actionLoadingId: string | number | null;
}

function TypeBadge({
  type,
}: {
  type: HistoryRow["type"];
}) {
  const isSummary = type === "Summary";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        isSummary
          ? "bg-violet-50 text-violet-600"
          : "bg-blue-50 text-blue-600"
      }`}
    >
      {isSummary ? (
        <FileText className="h-3.5 w-3.5" />
      ) : (
        <Search className="h-3.5 w-3.5" />
      )}

      {type}
    </span>
  );
}

export default function HistoryTable({
  rows,
  onSave,
  onDelete,
  onOpen,
  actionLoadingId,
}: HistoryTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(
    null
  );
  const [showSaveMessage, setShowSaveMessage] = useState(false);

 const handleSave = async (row: HistoryRow) => {
  // Search history cannot be saved
  if (row.type === "Search") {
    setShowSaveMessage(true);

    setTimeout(() => {
      setShowSaveMessage(false);
    }, 2500);

    setOpenMenuId(null);
    return;
  }

  if (!onSave) return;

  try {
    await onSave(row);
  } catch (error) {
    console.error(
      "SAVE HISTORY ERROR:",
      error
    );
  }

  setOpenMenuId(null);
};

  const handleDelete = async (row: HistoryRow) => {
    setOpenMenuId(null);

    try {
      await onDelete(row);
    } catch (error) {
      console.error("Delete history error:", error);
    }
  };

  const handleOpen = (row: HistoryRow) => {
    setOpenMenuId(null);
    onOpen(row);
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        {showSaveMessage && (
  <div className="fixed right-6 top-6 z-[9999] flex items-center gap-3 rounded-xl border border-amber-200 bg-white px-5 py-4 shadow-xl">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
      <Bookmark className="h-5 w-5 text-amber-600" />
    </div>

    <div>
      <p className="text-sm font-semibold text-slate-800">
        Cannot save search
      </p>

      <p className="text-xs text-slate-500">
        Only generated summaries can be saved.
      </p>
    </div>

    <button
      type="button"
      onClick={() => setShowSaveMessage(false)}
      className="ml-2 text-slate-400 hover:text-slate-600"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
)}
        <table className="min-w-[850px] w-full border-collapse">
          {/* ================================
              TABLE HEADER
          ================================= */}
          <thead>
            <tr className="border-b border-slate-100 bg-white">
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Topic / Summary
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Type
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Date
              </th>

              <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          {/* ================================
              TABLE BODY
          ================================= */}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-50">
                      <FileText className="h-5 w-5 text-violet-500" />
                    </div>

                    <p className="text-sm font-medium text-slate-700">
                      No history found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Your searches and summaries will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const isLoading = actionLoadingId === row.id;
                const isMenuOpen = openMenuId === row.id;

                return (
                  <tr
                    key={`${row.type}-${row.id}`}
                    className={`transition-all duration-200 hover:bg-violet-50/40 ${
                      index !== rows.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    {/* ================================
                        TOPIC / SUMMARY
                    ================================= */}
                    <td className="px-6 py-5 align-middle">
                      <button
                        type="button"
                        onClick={() => handleOpen(row)}
                        className="flex w-full cursor-pointer items-center gap-4 text-left"
                      >
                        {/* Icon */}
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${row.iconBg}`}
                        >
                          {row.type === "Summary" ? (
                            <FileText
                              className={`h-5 w-5 ${row.iconText}`}
                            />
                          ) : (
                            <Search
                              className={`h-5 w-5 ${row.iconText}`}
                            />
                          )}
                        </div>

                        {/* Text */}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800 hover:text-violet-600">
                            {row.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {row.description}
                          </p>
                        </div>
                      </button>
                    </td>

                    {/* ================================
                        TYPE
                    ================================= */}
                    <td className="px-6 py-5 align-middle">
                      <TypeBadge type={row.type} />
                    </td>

                    {/* ================================
                        DATE
                    ================================= */}
                    <td className="px-6 py-5 align-middle">
                      {row.date ? (
                        <>
                          <p className="text-sm font-medium text-slate-700">
                            {row.date}
                          </p>

                          <p className="text-xs text-slate-500">
                            {row.time}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Date unavailable
                        </span>
                      )}
                    </td>

                    {/* ================================
                        ACTIONS
                    ================================= */}
                    <td className="px-6 py-5 align-middle">
                      <div className="relative flex items-center justify-end gap-2">
                        {/* SAVE */}
                        <button
                          type="button"
                          title="Save"
                          disabled={isLoading}
                          onClick={() => handleSave(row)}
                          className={`cursor-pointer rounded-lg p-2 transition-all ${
                            isLoading
                              ? "cursor-not-allowed text-slate-300"
                              : "text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                          }`}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>

                        {/* DELETE */}
<button
  type="button"
  title="Delete"
  disabled={isLoading}
  onClick={() => handleDelete(row)}
  className="cursor-pointer rounded-lg p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  <Trash2 className="h-4 w-4" />
</button>

                        {/* ================================
                            THREE DOT MENU
                        ================================= */}
                       
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import HistoryHeader from "@/components/history/HistoryHeader";
import HistoryFilters, {
  HistoryTab,
  DateFilter,
} from "@/components/history/HistoryFilters";

import HistoryTable, {
  HistoryRow,
} from "@/components/history/HistoryTable";

import HistoryPagination from "@/components/history/HistoryPagination";

import { auth } from "@/app/lib/firebase";

const ITEMS_PER_PAGE = 6;

export default function HistoryPage() {
  // ============================================
  // STATE
  // ============================================

  const [history, setHistory] = useState<HistoryRow[]>([]);

  const [activeTab, setActiveTab] =
    useState<HistoryTab>("All");

  const [dateFilter, setDateFilter] =
    useState<DateFilter>("All Time");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [isClearing, setIsClearing] =
    useState(false);

  const [actionLoadingId, setActionLoadingId] =
    useState<string | number | null>(null);

  // ============================================
  // LOAD HISTORY
  // ============================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          setLoading(true);
          setError("");

          if (!user) {
            setHistory([]);
            setError(
              "Please login to view your history."
            );
            setLoading(false);
            return;
          }

          const token =
            await user.getIdToken();

          const response = await fetch(
            "/api/history",
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.error ||
                data?.message ||
                "Failed to load history"
            );
          }

          setHistory(
            Array.isArray(data.history)
              ? data.history
              : []
          );
        } catch (error) {
          console.error(
            "HISTORY LOAD ERROR:",
            error
          );

          setHistory([]);

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load your history."
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // ============================================
  // FILTER HISTORY
  // ============================================

  const filteredHistory = useMemo(() => {
    let result = [...history];

    // ==========================================
    // TYPE FILTER
    // ==========================================

    if (activeTab === "Summaries") {
      result = result.filter(
        (item) =>
          item.type === "Summary"
      );
    }

    if (activeTab === "Searches") {
      result = result.filter(
        (item) =>
          item.type === "Search"
      );
    }

    // ==========================================
    // DATE FILTER
    // ==========================================

    if (dateFilter !== "All Time") {
      const now = new Date();

      let startDate: Date;

      switch (dateFilter) {
        case "Today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;

        case "This Week": {
          const day = now.getDay();

          const diff =
            day === 0 ? 6 : day - 1;

          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - diff
          );

          break;
        }

        case "This Month":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
          );
          break;

        case "Last 7 Days":
          startDate = new Date(
            now.getTime() -
              7 *
                24 *
                60 *
                60 *
                1000
          );
          break;

        case "Last 30 Days":
          startDate = new Date(
            now.getTime() -
              30 *
                24 *
                60 *
                60 *
                1000
          );
          break;

        default:
          startDate = new Date(0);
      }

      result = result.filter(
        (item) => {
          if (!item.createdAt) {
            return false;
          }

          const itemDate =
            new Date(
              item.createdAt
            );

          return (
            !Number.isNaN(
              itemDate.getTime()
            ) &&
            itemDate >= startDate
          );
        }
      );
    }

    // ==========================================
    // NEWEST FIRST
    // ==========================================

    result.sort((a, b) => {
      if (
        !a.createdAt ||
        !b.createdAt
      ) {
        return 0;
      }

      return (
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
      );
    });

    return result;
  }, [
    history,
    activeTab,
    dateFilter,
  ]);

  // ============================================
  // PAGINATION
  // ============================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredHistory.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedHistory =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      const end =
        start + ITEMS_PER_PAGE;

      return filteredHistory.slice(
        start,
        end
      );
    }, [
      filteredHistory,
      currentPage,
    ]);

  // ============================================
  // RESET PAGE WHEN FILTER CHANGES
  // ============================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    dateFilter,
  ]);

  // ============================================
  // KEEP PAGE VALID
  // ============================================

  useEffect(() => {
    if (
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // ============================================
  // CLEAR HISTORY
  // ============================================

  const handleClearHistory =
    async () => {
      try {
        setError("");
        setIsClearing(true);

        const firebaseUser =
          auth.currentUser;

        if (!firebaseUser) {
          throw new Error(
            "User is not logged in."
          );
        }

        const token =
          await firebaseUser.getIdToken();

        const response =
          await fetch(
            "/api/user/clear-history",
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify({}),
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let data: any = {};

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          data =
            await response.json();
        } else {
          const text =
            await response.text();

          console.error(
            "CLEAR HISTORY NON-JSON RESPONSE:",
            text
          );

          throw new Error(
            `Server returned ${response.status} instead of JSON.`
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Failed to clear history."
          );
        }

        setHistory([]);
        setCurrentPage(1);
        setError("");
      } catch (error) {
        console.error(
          "CLEAR HISTORY ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to clear history."
        );
      } finally {
        setIsClearing(false);
      }
    };

  // ============================================
  // SAVE HISTORY ITEM
  // ============================================

  const handleSaveHistory =
    async (row: HistoryRow) => {
      try {
        setError("");
        setActionLoadingId(row.id);

        const firebaseUser =
          auth.currentUser;

        if (!firebaseUser) {
          throw new Error(
            "Please login first."
          );
        }

        /*
         * Search items cannot be saved as
         * summaries because they don't contain
         * summary markdown.
         */

        if (row.type !== "Summary") {
          throw new Error(
            "Only generated summaries can be saved."
          );
        }

        const token =
          await firebaseUser.getIdToken();

        const response =
          await fetch(
            "/api/saved-summary",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify({
                userId:
                  firebaseUser.uid,
                title:
                  row.title,
                markdown:
                  row.description ||
                  "",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Failed to save summary."
          );
        }

        setError("");

        console.log(
          "SUMMARY SAVED:",
          row.title
        );
      } catch (error) {
        console.error(
          "SAVE HISTORY ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to save summary."
        );
      } finally {
        setActionLoadingId(null);
      }
    };

  // ============================================
  // DELETE HISTORY ITEM
  // ============================================

  const handleDeleteHistory =
    async (row: HistoryRow) => {
      try {
        setError("");
        setActionLoadingId(row.id);

        const firebaseUser =
          auth.currentUser;

        if (!firebaseUser) {
          throw new Error(
            "Please login first."
          );
        }

        const token =
          await firebaseUser.getIdToken();

        const response =
          await fetch(
            `/api/history?id=${encodeURIComponent(
              String(row.id)
            )}`,
            {
              method: "DELETE",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let data: any = {};

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          data =
            await response.json();
        } else {
          const text =
            await response.text();

          console.error(
            "DELETE HISTORY NON-JSON RESPONSE:",
            text
          );

          throw new Error(
            `Server returned ${response.status} instead of JSON.`
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Failed to delete history item."
          );
        }

        setHistory((previous) =>
          previous.filter(
            (item) =>
              String(item.id) !==
              String(row.id)
          )
        );

        setError("");
      } catch (error) {
        console.error(
          "DELETE HISTORY ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to delete history item."
        );
      } finally {
        setActionLoadingId(null);
      }
    };

  // ============================================
  // OPEN HISTORY ITEM
  // ============================================

  const handleOpenHistory =
    (row: HistoryRow) => {
      try {
        /*
         * For now open the summary/search
         * using the title as a query parameter.
         *
         * We will connect this to the actual
         * summary page after testing the buttons.
         */

        const encodedTitle =
          encodeURIComponent(
            row.title
          );

        if (
          row.type === "Summary"
        ) {
          window.location.href =
            `/summary?title=${encodedTitle}`;
      } else {
 window.location.href =
  `/search?q=${encodedTitle}&results=true`;
}
      } catch (error) {
        console.error(
          "OPEN HISTORY ERROR:",
          error
        );

        setError(
          "Unable to open this history item."
        );
      }
    };

  // ============================================
  // PAGE
  // ============================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <HistoryHeader />

      {/* FILTERS */}

      <HistoryFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        onClearHistory={
          handleClearHistory
        }
      />

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your history...
          </p>

        </div>
      ) : (
        <>
          {/* EMPTY */}

          {paginatedHistory.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                <span className="text-2xl">
                  📚
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-800">
                No history found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {history.length === 0
                  ? "Your searches and summaries will appear here."
                  : "No history matches the selected filters."}
              </p>

            </div>
          ) : (
            <>
              {/* TABLE */}

              <HistoryTable
                rows={paginatedHistory}
                onSave={
                  handleSaveHistory
                }
                onDelete={
                  handleDeleteHistory
                }
                onOpen={
                  handleOpenHistory
                }
                actionLoadingId={
                  actionLoadingId
                }
              />

              {/* PAGINATION */}

              {totalPages > 1 && (
                <HistoryPagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  onPageChange={
                    setCurrentPage
                  }
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
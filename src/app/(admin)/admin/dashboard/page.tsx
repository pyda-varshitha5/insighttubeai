"use client";

import { useEffect, useState } from "react";
import type { ElementType } from "react";
import {
  Users,
  Search,
  FileText,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

// ======================================================
// TYPES
// ======================================================

type UserStatus = "Active" | "Inactive";

type UserAnalytics = {
  uid: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  photoURL?: string;

  searches?: number;
  summaries?: number;
  savedSummaries?: number;
  quizzesCompleted?: number;

  lastActive?: string;
  lastSignIn?: string;
  createdAt?: string;
  joinedOn?: string;

  status?: UserStatus;
};

type RegistrationData = {
  date: string;
  count: number;
};

type AnalyticsData = {
  success?: boolean;

  stats?: {
    totalUsers?: number;
    totalSearches?: number;
    totalSummaries?: number;
    totalSavedSummaries?: number;
    totalQuizzesCompleted?: number;
    activeUsers?: number;
    activeUsers7Days?: number;
  };

  users?: UserAnalytics[];

  analytics?: {
    registrations?: RegistrationData[];

    searchesByUser?: {
      name: string;
      email: string;
      searches: number;
    }[];

    summariesByUser?: {
      name: string;
      email: string;
      summaries: number;
    }[];
  };
};

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: ElementType;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 text-xs text-slate-500">
            {title}
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">
            {value.toLocaleString()}
          </h2>

          <p className="mt-2 text-xs font-medium text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// USER STATUS
// ======================================================

function getStatus(lastActive?: string): UserStatus {
  if (!lastActive) {
    return "Inactive";
  }

  const last = new Date(lastActive).getTime();

  if (Number.isNaN(last)) {
    return "Inactive";
  }

  const now = Date.now();

  // Active if user was active within last 20 days
  const twentyDays =
    20 * 24 * 60 * 60 * 1000;

  return now - last <= twentyDays
    ? "Active"
    : "Inactive";
}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date?: string) {
  if (!date) {
    return "Never";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Never";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

// ======================================================
// FORMAT LAST ACTIVE
// ======================================================

function formatLastActive(date?: string) {
  if (!date) {
    return "Never";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Never";
  }

  const difference =
    Date.now() - parsedDate.getTime();

  if (difference < 0) {
    return "Just now";
  }

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  const hours = Math.floor(
    difference / (1000 * 60 * 60)
  );

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  if (days < 20) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

// ======================================================
// MINI CHART
// ======================================================

function MiniChart({
  data,
}: {
  data: number[];
}) {
  const width = 300;
  const height = 100;

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center text-xs text-slate-400">
        No data available
      </div>
    );
  }

  const safeData = data.map((value) =>
    Number.isFinite(value) ? value : 0
  );

  const max = Math.max(...safeData);
  const min = Math.min(...safeData);

  const points = safeData
    .map((value, index) => {
      const x =
        safeData.length === 1
          ? width / 2
          : (index / (safeData.length - 1)) *
            width;

      const y =
        height -
        ((value - min) /
          (max - min || 1)) *
          (height - 20) -
        10;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-28 w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-violet-500"
        />

        {safeData.map((value, index) => {
          const x =
            safeData.length === 1
              ? width / 2
              : (index /
                  (safeData.length - 1)) *
                width;

          const y =
            height -
            ((value - min) /
              (max - min || 1)) *
              (height - 20) -
            10;

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              className="fill-violet-500"
            />
          );
        })}
      </svg>
    </div>
  );
}

// ======================================================
// ADMIN DASHBOARD
// ======================================================

export default function AdminDashboardPage() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [data, setData] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // FETCH ADMIN ANALYTICS
  // ====================================================

  useEffect(() => {
    let cancelled = false;

    const fetchAnalytics = async () => {
      try {
        if (authLoading) {
          return;
        }

        if (!user) {
          if (!cancelled) {
            setError("Please login again.");
            setLoading(false);
          }

          return;
        }

        if (!cancelled) {
          setLoading(true);
          setError("");
        }

        const token =
          await user.getIdToken(true);

        if (!token) {
          throw new Error(
            "Authentication token not available."
          );
        }

        const response = await fetch(
          "/api/analytics",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },

            cache: "no-store",
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let result: AnalyticsData & {
          error?: string;
        };

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          result = await response.json();
        } else {
          const text =
            await response.text();

          throw new Error(
            `Server returned non-JSON response (${response.status}). ${text.slice(
              0,
              150
            )}`
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.error ||
              `Analytics request failed (${response.status})`
          );
        }

        if (
          result?.success === false
        ) {
          throw new Error(
            result?.error ||
              "Failed to load admin analytics."
          );
        }

        if (!cancelled) {
          setData(result);
          setError("");
        }
      } catch (err) {
        console.error(
          "Dashboard analytics error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard data."
          );

          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  // ====================================================
  // AUTH LOADING
  // ====================================================

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  // ====================================================
  // DATA LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-xl border border-red-200 bg-white px-6 py-5 text-sm text-red-600 shadow-sm">
          {error ||
            "Failed to load dashboard."}
        </div>
      </main>
    );
  }

  // ====================================================
  // SAFE DATA
  // ====================================================

  // IMPORTANT:
  // Never use data.users directly for map/filter.
  // The API may omit users or return undefined.

  const users: UserAnalytics[] =
    Array.isArray(data.users)
      ? data.users
      : [];

  const stats = {
    totalUsers:
      data.stats?.totalUsers ?? users.length,

    totalSearches:
      data.stats?.totalSearches ?? 0,

    totalSummaries:
      data.stats?.totalSummaries ?? 0,

    totalSavedSummaries:
      data.stats?.totalSavedSummaries ?? 0,

    totalQuizzesCompleted:
      data.stats?.totalQuizzesCompleted ?? 0,

    activeUsers:
      data.stats?.activeUsers ?? 0,
  };

  // ====================================================
  // ACTIVE USERS — 20 DAYS
  // ====================================================

  const activeUsers = users.filter(
    (currentUser) =>
      getStatus(currentUser.lastActive) ===
      "Active"
  ).length;

  // ====================================================
  // REGISTRATION CHART DATA
  // ====================================================

  const registrationData =
    Array.isArray(
      data.analytics?.registrations
    ) &&
    data.analytics.registrations.length > 0
      ? data.analytics.registrations.map(
          (item) => item.count ?? 0
        )
      : users.map(() => 1);

  // ====================================================
  // SEARCH CHART DATA
  // ====================================================

  const searchData = users.map(
    (currentUser) =>
      currentUser.searches ?? 0
  );

  // ====================================================
  // SUMMARY CHART DATA
  // ====================================================

  const summaryData = users.map(
    (currentUser) =>
      currentUser.summaries ?? 0
  );

  // ====================================================
  // QUIZ CHART DATA
  // ====================================================

  const quizData = users.map(
    (currentUser) =>
      currentUser.quizzesCompleted ?? 0
  );

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-7">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              InsightTube-AI
            </h1>

            <p className="mt-1 text-sm text-violet-500">
              Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
            <CalendarDays size={16} />

            {new Date().toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </div>
        </div>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="All registered users"
            icon={Users}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Active Users"
            value={activeUsers}
            subtitle="Active in last 20 days"
            icon={Users}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Total Summaries"
            value={stats.totalSummaries}
            subtitle="All time summaries"
            icon={FileText}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Total Searches"
            value={stats.totalSearches}
            subtitle="All time searches"
            icon={Search}
            iconClass="bg-orange-50 text-orange-500"
          />

          <StatCard
            title="Quizzes Attempted"
            value={
              stats.totalQuizzesCompleted
            }
            subtitle="All quizzes completed"
            icon={ClipboardCheck}
            iconClass="bg-pink-50 text-pink-500"
          />

        </div>

        {/* ==================================================
            USERS OVERVIEW
        ================================================== */}

        <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Users Overview
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500">

                  <th className="px-5 py-3 text-left font-medium">
                    User
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Email
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Joined On
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Summaries
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Searches
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Quizzes Attempted
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Last Active
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-center text-slate-400"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map(
                    (currentUser) => {
                      const status =
                        getStatus(
                          currentUser.lastActive
                        );

                      const displayName =
                        currentUser.name ||
                        `${currentUser.firstName || ""} ${
                          currentUser.lastName || ""
                        }`.trim() ||
                        "Unknown User";

                      return (
                        <tr
                          key={
                            currentUser.uid
                          }
                          className="border-t border-slate-100"
                        >

                          {/* USER */}

                          <td className="px-5 py-3.5 font-medium text-slate-800">

                            <div className="flex items-center gap-3">

                              {currentUser.photoURL ? (
                                <img
                                  src={
                                    currentUser.photoURL
                                  }
                                  alt={
                                    displayName
                                  }
                                  className="h-9 w-9 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-600">
                                  {displayName
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>
                              )}

                              <span>
                                {displayName}
                              </span>

                            </div>

                          </td>

                          {/* EMAIL */}

                          <td className="px-5 py-3.5 text-slate-500">
                            {currentUser.email ||
                              "No email"}
                          </td>

                          {/* JOINED */}

                          <td className="px-5 py-3.5 text-slate-500">
                            {formatDate(
                              currentUser.createdAt ||
                                currentUser.joinedOn
                            )}
                          </td>

                          {/* SUMMARIES */}

                          <td className="px-5 py-3.5 text-slate-600">
                            {currentUser.summaries ??
                              0}
                          </td>

                          {/* SEARCHES */}

                          <td className="px-5 py-3.5 text-slate-600">
                            {currentUser.searches ??
                              0}
                          </td>

                          {/* QUIZZES */}

                          <td className="px-5 py-3.5 text-slate-600">
                            {currentUser.quizzesCompleted ??
                              0}
                          </td>

                          {/* LAST ACTIVE */}

                          <td className="px-5 py-3.5 text-slate-500">
                            {formatLastActive(
                              currentUser.lastActive
                            )}
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-3.5">

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                status ===
                                "Active"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {status}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* ==================================================
            ANALYTICS
        ================================================== */}

        <section>

          <h2 className="mb-4 font-semibold text-slate-900">
            Analytics Overview
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* REGISTRATIONS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="mb-3 text-xs text-slate-500">
                User Registrations
              </p>

              <MiniChart
                data={registrationData}
              />

              <div className="mt-2 flex justify-between text-[10px] text-slate-400">

                <span>
                  Registrations
                </span>

                <span>
                  {users.length} total
                </span>

              </div>

            </div>

            {/* SEARCHES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="mb-3 text-xs text-slate-500">
                Searches by User
              </p>

              <MiniChart
                data={searchData}
              />

              <div className="mt-2 flex justify-between text-[10px] text-slate-400">

                <span>
                  Users
                </span>

                <span>
                  {stats.totalSearches} total
                </span>

              </div>

            </div>

            {/* SUMMARIES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="mb-3 text-xs text-slate-500">
                Summaries by User
              </p>

              <MiniChart
                data={summaryData}
              />

              <div className="mt-2 flex justify-between text-[10px] text-slate-400">

                <span>
                  Users
                </span>

                <span>
                  {stats.totalSummaries} total
                </span>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
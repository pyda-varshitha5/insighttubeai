"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  FileText,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

type UserAnalytics = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  searches: number;
  summaries: number;
  savedSummaries: number;
  lastActive?: string;
  createdAt?: string;
};

type AnalyticsData = {
  success: boolean;
  stats: {
    totalUsers: number;
    totalSearches: number;
    totalSummaries: number;
    totalSavedSummaries: number;
  };
  users: UserAnalytics[];
};

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 text-xs text-slate-500">{title}</p>

          <h2 className="text-2xl font-semibold text-slate-900">
            {value.toLocaleString()}
          </h2>

          <p className="mt-2 text-xs font-medium text-slate-400">
            Current platform data
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

function getStatus(lastActive?: string) {
  if (!lastActive) return "Inactive";

  const last = new Date(lastActive).getTime();
  const now = Date.now();

  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return now - last <= sevenDays ? "Active" : "Inactive";
}

function formatDate(date?: string) {
  if (!date) return "Never";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLastActive(date?: string) {
  if (!date) return "Never";

  const last = new Date(date).getTime();
  const now = Date.now();

  const difference = now - last;

  const minutes = Math.floor(difference / (1000 * 60));
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Date(date).toLocaleDateString("en-IN");
}

function MiniChart({ data }: { data: number[] }) {
  const width = 300;
  const height = 100;

  if (!data.length) {
    return (
      <div className="flex h-28 items-center justify-center text-xs text-slate-400">
        No data available
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data
    .map((value, index) => {
      const x =
        data.length === 1
          ? width / 2
          : (index / (data.length - 1)) * width;

      const y =
        height -
        ((value - min) / (max - min || 1)) * (height - 20) -
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

        {data.map((value, index) => {
          const x =
            data.length === 1
              ? width / 2
              : (index / (data.length - 1)) * width;

          const y =
            height -
            ((value - min) / (max - min || 1)) * (height - 20) -
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/analytics", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const result = await response.json();

        console.log("Admin Dashboard Analytics:", result);

        if (!result.success) {
          throw new Error("Analytics request failed");
        }

        setData(result);
      } catch (err) {
        console.error("Dashboard analytics error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-red-200 bg-white px-6 py-5 text-sm text-red-600 shadow-sm">
          {error || "Failed to load dashboard."}
        </div>
      </main>
    );
  }

  const activeUsers = data.users.filter(
    (user) => getStatus(user.lastActive) === "Active"
  ).length;

  /*
   * These values are based on real users returned by /api/analytics.
   * We are intentionally not using fake sample numbers.
   */
  const registrationData = data.users.map(() => 1);

const searchData = data.users.map((user) => user.searches);

const summaryData = data.users.map((user) => user.summaries);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-7">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
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

            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Users"
            value={data.stats.totalUsers}
            icon={Users}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Total Searches"
            value={data.stats.totalSearches}
            icon={Search}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Summaries Generated"
            value={data.stats.totalSummaries}
            icon={FileText}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Active Users (7 Days)"
            value={activeUsers}
            icon={TrendingUp}
            iconClass="bg-orange-50 text-orange-500"
          />

        </div>

        {/* Users Overview */}
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
                    Last Active
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {data.users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-slate-400"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  data.users.map((user) => {

                    const status = getStatus(user.lastActive);

                    return (
                      <tr
                        key={user.uid}
                        className="border-t border-slate-100"
                      >

                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          <div className="flex items-center gap-3">

                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.name}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-600">
                                {user.name?.charAt(0)?.toUpperCase() ||
                                  "U"}
                              </div>
                            )}

                            {user.name}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-slate-500">
                          {user.email}
                        </td>
<td className="px-5 py-3.5 text-slate-500">
  {formatDate(user.createdAt)}
</td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {user.summaries}
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {user.searches}
                        </td>

                        <td className="px-5 py-3.5 text-slate-500">
                          {formatLastActive(user.lastActive)}
                        </td>

                        <td className="px-5 py-3.5">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              status === "Active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {status}
                          </span>

                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>

            </table>
          </div>

        </section>

        {/* Analytics */}
        <section>

          <h2 className="mb-4 font-semibold text-slate-900">
            Analytics Overview
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* Registrations */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="mb-3 text-xs text-slate-500">
                User Registrations
              </p>

              <MiniChart data={registrationData} />

              <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                <span>Users</span>
                <span>{data.users.length} total</span>
              </div>

            </div>

            {/* Searches */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="mb-3 text-xs text-slate-500">
                Searches by User
              </p>

              <MiniChart data={searchData} />

              <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                <span>Users</span>
                <span>{data.stats.totalSearches} total</span>
              </div>

            </div>

            {/* Summaries */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="mb-3 text-xs text-slate-500">
                Summaries by User
              </p>

              <MiniChart data={summaryData} />

              <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                <span>Users</span>
                <span>{data.stats.totalSummaries} total</span>
              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
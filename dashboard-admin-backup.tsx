"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Users,
  Search,
  FileText,
  Bookmark,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "@/context/AuthProvider";

interface AdminUser {
  uid?: string;
  id?: string;
  name?: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  joinedOn?: string;
  createdAt?: string;
  summaries?: number;
  totalSummaries?: number;
  searches?: number;
  totalSearches?: number;
  lastActive?: string;
  status?: string;
}

interface AdminStats {
  totalUsers: number;
  totalSearches: number;
  totalSummaries: number;
  totalSavedSummaries: number;
}

interface AnalyticsResponse {
  success?: boolean;
  stats?: AdminStats;
  users?: AdminUser[];
  error?: string;
}

const DEFAULT_STATS: AdminStats = {
  totalUsers: 0,
  totalSearches: 0,
  totalSummaries: 0,
  totalSavedSummaries: 0,
};

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLastActive(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diff = Date.now() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "1 day ago";

  return `${days} days ago`;
}

function getUserName(user: AdminUser) {
  return (
    user.name ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "Unknown User"
  );
}

function getInitial(user: AdminUser) {
  return getUserName(user).charAt(0).toUpperCase();
}

function getUserSummaries(user: AdminUser) {
  return Number(user.summaries ?? user.totalSummaries ?? 0);
}

function getUserSearches(user: AdminUser) {
  return Number(user.searches ?? user.totalSearches ?? 0);
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<AdminStats>(DEFAULT_STATS);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Get the Firebase ID token.
      const token = await user.getIdToken(true);

      const response = await fetch("/api/analytics", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      let result: AnalyticsResponse = {};

      try {
        result = await response.json();
      } catch {
        throw new Error(
          `Analytics API returned an invalid response (${response.status})`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.error ||
            `Analytics request failed (${response.status})`
        );
      }

      setStats({
        totalUsers: Number(result?.stats?.totalUsers ?? 0),
        totalSearches: Number(result?.stats?.totalSearches ?? 0),
        totalSummaries: Number(result?.stats?.totalSummaries ?? 0),
        totalSavedSummaries: Number(
          result?.stats?.totalSavedSummaries ?? 0
        ),
      });

      setUsers(Array.isArray(result?.users) ? result.users : []);
    } catch (err) {
      console.error("Dashboard analytics error:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Unable to load analytics";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /*
   * Listen for changes made elsewhere in the application.
   * When a search/summary/save occurs, refresh admin statistics.
   */
  useEffect(() => {
    const handleProgressUpdate = () => {
      fetchAnalytics();
    };

    window.addEventListener(
      "progress-updated",
      handleProgressUpdate
    );

    window.addEventListener(
      "analytics-updated",
      handleProgressUpdate
    );

    return () => {
      window.removeEventListener(
        "progress-updated",
        handleProgressUpdate
      );

      window.removeEventListener(
        "analytics-updated",
        handleProgressUpdate
      );
    };
  }, [fetchAnalytics]);

  /*
   * Authentication loading / user not available.
   */
  if (!user && loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm px-8 py-7 text-center max-w-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-red-500 text-xl">!</span>
          </div>

          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Unable to load analytics
          </h2>

          <p className="text-slate-500 text-sm mb-5">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Dashboard
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Monitor users, searches and summaries
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* ============================= */}
      {/* STATISTICS */}
      {/* ============================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Users */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Users
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalUsers}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Searches */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Searches
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalSearches}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
              <Search className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Summaries */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Summaries
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalSummaries}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Saved */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Saved Summaries
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalSavedSummaries}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* USERS OVERVIEW */}
      {/* ============================= */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Users Overview
          </h2>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading users...
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">
                    User
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">
                    Email
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">
                    Joined On
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">
                    Summaries
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">
                    Searches
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">
                    Last Active
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((item, index) => {
                  const name = getUserName(item);
                  const summaries = getUserSummaries(item);
                  const searches = getUserSearches(item);

                  return (
                    <tr
                      key={
                        item.uid ||
                        item.id ||
                        item.email ||
                        index
                      }
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition"
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.photoURL ? (
                            <img
                              src={item.photoURL}
                              alt={name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 font-semibold">
                                {getInitial(item)}
                              </span>
                            </div>
                          )}

                          <span className="font-medium text-slate-800">
                            {name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {item.email || "—"}
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          item.joinedOn || item.createdAt
                        )}
                      </td>

                      {/* Summaries */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {summaries}
                      </td>

                      {/* Searches */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {searches}
                      </td>

                      {/* Last Active */}
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatLastActive(item.lastActive)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {item.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================= */}
      {/* ANALYTICS OVERVIEW */}
      {/* ============================= */}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Analytics Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User Registrations */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>

              <div>
                <h3 className="font-medium text-slate-900">
                  User Registrations
                </h3>

                <p className="text-xs text-slate-400">
                  Current total
                </p>
              </div>
            </div>

            <p className="text-3xl font-bold text-slate-900">
              {stats.totalUsers}
            </p>
          </div>

          {/* Searches */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Search className="w-5 h-5 text-purple-600" />
              </div>

              <div>
                <h3 className="font-medium text-slate-900">
                  Searches by Users
                </h3>

                <p className="text-xs text-slate-400">
                  Total searches
                </p>
              </div>
            </div>

            <p className="text-3xl font-bold text-slate-900">
              {stats.totalSearches}
            </p>
          </div>

          {/* Summaries */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>

              <div>
                <h3 className="font-medium text-slate-900">
                  Summaries by Users
                </h3>

                <p className="text-xs text-slate-400">
                  Total summaries
                </p>
              </div>
            </div>

            <p className="text-3xl font-bold text-slate-900">
              {stats.totalSummaries}
            </p>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* SMALL FOOTER INFO */}
      {/* ============================= */}

      <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        <span>
          Admin analytics are loaded from the latest database data.
        </span>
      </div>
    </div>
  );
}
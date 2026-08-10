"use client";

import React, {
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  BarChart3,
  Clock,
  Bookmark,
  TrendingUp,
  Search,
  FileText,
} from "lucide-react";

import { useAuth } from "@/context/AuthProvider";

interface ProgressData {
  totalSearches: number;
  totalSummaries: number;
  savedSummaries: number;
  timeSavedMinutes?: number;
  hoursSaved?: number;
}

interface WeeklyActivity {
  day: string;
  date: string;
  searches: number;
  summaries: number;
  value: number;
}

interface RecentLearning {
  id: string;
  title: string;
  description: string;
  type: string;
  time: string;
}

interface AnalyticsData {
  weeklyActivity: WeeklyActivity[];
  recentLearning: RecentLearning[];
  activityPercent: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();

  const [progress, setProgress] =
    useState<ProgressData>({
      totalSearches: 0,
      totalSummaries: 0,
      savedSummaries: 0,
      timeSavedMinutes: 0,
      hoursSaved: 0,
    });

  const [analytics, setAnalytics] =
    useState<AnalyticsData>({
      weeklyActivity: [],
      recentLearning: [],
      activityPercent: 0,
    });

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // LOAD ANALYTICS
  // =====================================================

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        // =================================================
        // 1. LOAD PROGRESS
        // =================================================

        const progressResponse =
          await fetch(
            `/api/progress?userId=${encodeURIComponent(
              user.uid
            )}`,
            {
              cache: "no-store",
            }
          );

        if (progressResponse.ok) {
          const progressData =
            await progressResponse.json();

          setProgress({
            totalSearches: Number(
              progressData.totalSearches || 0
            ),

            totalSummaries: Number(
              progressData.totalSummaries || 0
            ),

            savedSummaries: Number(
              progressData.savedSummaries || 0
            ),

            timeSavedMinutes: Number(
              progressData.timeSavedMinutes || 0
            ),

            hoursSaved: Number(
              progressData.hoursSaved || 0
            ),
          });
        }

        // =================================================
        // 2. FIREBASE TOKEN
        // =================================================

        const firebaseUser =
          user as any;

        let token = "";

        if (
          firebaseUser &&
          typeof firebaseUser.getIdToken ===
            "function"
        ) {
          token =
            await firebaseUser.getIdToken();
        }

        // =================================================
        // 3. LOAD USER ANALYTICS
        // =================================================

        const analyticsResponse =
          await fetch(
            "/api/user-analytics",
            {
              method: "GET",

              headers: token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {},

              cache: "no-store",
            }
          );

        if (!analyticsResponse.ok) {
          const errorData =
            await analyticsResponse
              .json()
              .catch(() => null);

          throw new Error(
            errorData?.error ||
              "Failed to load analytics"
          );
        }

        const analyticsData =
          await analyticsResponse.json();

        if (
          analyticsData?.analytics
        ) {
          setAnalytics({
            weeklyActivity:
              Array.isArray(
                analyticsData.analytics
                  .weeklyActivity
              )
                ? analyticsData.analytics
                    .weeklyActivity
                : [],

            recentLearning:
              Array.isArray(
                analyticsData.analytics
                  .recentLearning
              )
                ? analyticsData.analytics
                    .recentLearning
                : [],

            activityPercent: Number(
              analyticsData.analytics
                .activityPercent || 0
            ),
          });
        }
      } catch (error) {
        console.error(
          "Analytics loading error:",
          error
        );

        setAnalytics({
          weeklyActivity: [],
          recentLearning: [],
          activityPercent: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  // =====================================================
  // REFRESH WHEN PROGRESS CHANGES
  // =====================================================

  useEffect(() => {
    const refreshAnalytics = () => {
      if (!user) return;

      window.location.reload();
    };

    window.addEventListener(
      "progress-updated",
      refreshAnalytics
    );

    return () => {
      window.removeEventListener(
        "progress-updated",
        refreshAnalytics
      );
    };
  }, [user]);

  // =====================================================
  // TIME SAVED
  // =====================================================

  const timeSavedHours = (
    Number(
      progress.timeSavedMinutes || 0
    ) / 60
  ).toFixed(1);

  // =====================================================
  // WEEKLY MAX
  // =====================================================

  const maxActivity =
    analytics.weeklyActivity.length > 0
      ? Math.max(
          ...analytics.weeklyActivity.map(
            (item) => item.value
          ),
          1
        )
      : 1;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="w-full px-8 py-6">
        <div className="mb-6">
          <div className="h-7 w-32 rounded bg-slate-200 animate-pulse" />

          <div className="mt-2 h-4 w-64 rounded bg-slate-200 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-44 rounded-2xl border border-slate-200 bg-white animate-pulse"
              />
            )
          )}
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="w-full px-8 py-6">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track your learning activity and progress.
        </p>
      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOPICS EXPLORED */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
            <BookOpen
              size={22}
              className="text-violet-600"
            />
          </div>

          <p className="text-sm text-slate-500">
            Topics Explored
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {progress.totalSearches}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Total topics
          </p>
        </div>

        {/* SUMMARIES */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
            <BarChart3
              size={22}
              className="text-violet-600"
            />
          </div>

          <p className="text-sm text-slate-500">
            Summaries Generated
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {progress.totalSummaries}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            AI summaries
          </p>
        </div>

        {/* TIME SAVED */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
            <Clock
              size={22}
              className="text-violet-600"
            />
          </div>

          <p className="text-sm text-slate-500">
            Time Saved
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {timeSavedHours}h
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Hours
          </p>
        </div>

        {/* SAVED ITEMS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
            <Bookmark
              size={22}
              className="text-violet-600"
            />
          </div>

          <p className="text-sm text-slate-500">
            Saved Items
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {progress.savedSummaries}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Total
          </p>
        </div>
      </div>

      {/* =================================================
          LEARNING ACTIVITY + LEARNING INSIGHTS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* =================================================
            LEARNING ACTIVITY
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

          <div className="mb-6 flex items-start justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Learning Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your activity over the past week
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-600">
              <TrendingUp size={15} />
              This Week
            </div>
          </div>

          {/* =================================================
              SUN -> SAT CHART
          ================================================= */}

          <div className="h-64">

            {analytics.weeklyActivity.length ===
            0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No activity this week yet.
              </div>
            ) : (
              <div className="flex h-full items-end justify-between gap-3 px-2">

                {analytics.weeklyActivity.map(
                  (item) => {

                    const height =
                      item.value === 0
                        ? 4
                        : Math.max(
                            (item.value /
                              maxActivity) *
                              180,
                            12
                          );

                    return (
                      <div
                        key={item.date}
                        className="flex h-full flex-1 flex-col items-center justify-end"
                      >

                        {/* VALUE */}

                        {item.value > 0 && (
                          <span className="mb-2 text-xs text-slate-500">
                            {item.value}
                          </span>
                        )}

                        {/* BAR */}

                        <div
                          className="w-full max-w-10 rounded-t-xl bg-violet-500 transition-all"
                          style={{
                            height:
                              `${height}px`,
                          }}
                          title={`${item.day}: ${item.value} activities`}
                        />

                        {/* DAY */}

                        <span className="mt-3 text-xs text-slate-400">
                          {item.day}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>
            )}
          </div>
        </div>

        {/* =================================================
            LEARNING INSIGHTS
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Learning Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your weekly progress
            </p>
          </div>

          {/* CIRCLE */}

          <div className="mb-6 flex justify-center">

            <div
              className="relative flex h-36 w-36 items-center justify-center rounded-full"
              style={{
                background:
                  `conic-gradient(
                    rgb(139 92 246)
                    ${analytics.activityPercent}%,
                    rgb(245 243 255)
                    ${analytics.activityPercent}% 100%
                  )`,
              }}
            >

              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">

                <span className="text-2xl font-bold text-slate-900">
                  {analytics.activityPercent}%
                </span>

                <span className="text-xs text-slate-400">
                  Activity
                </span>

              </div>
            </div>
          </div>

          {/* SUMMARY */}

          <div className="space-y-4">

            {/* SEARCHES */}

            <div>
              <div className="mb-2 flex justify-between">

                <span className="text-sm text-slate-600">
                  Searches
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {progress.totalSearches}
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-violet-400"
                  style={{
                    width:
                      `${Math.min(
                        progress.totalSearches *
                          10,
                        100
                      )}%`,
                  }}
                />

              </div>
            </div>

            {/* SUMMARIES */}

            <div>
              <div className="mb-2 flex justify-between">

                <span className="text-sm text-slate-600">
                  Summaries
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {progress.totalSummaries}
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-violet-400"
                  style={{
                    width:
                      `${Math.min(
                        progress.totalSummaries *
                          10,
                        100
                      )}%`,
                  }}
                />

              </div>
            </div>

            {/* SAVED */}

            <div>
              <div className="mb-2 flex justify-between">

                <span className="text-sm text-slate-600">
                  Saved Items
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {progress.savedSummaries}
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-violet-400"
                  style={{
                    width:
                      `${Math.min(
                        progress.savedSummaries *
                          10,
                        100
                      )}%`,
                  }}
                />

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =================================================
          RECENT LEARNING
      ================================================= */}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5">

          <h2 className="text-lg font-semibold text-slate-900">
            Recent Learning
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest searches and learning activity
          </p>

        </div>

        {analytics.recentLearning.length ===
        0 ? (
          <div className="py-8 text-center">

            <Search
              size={24}
              className="mx-auto mb-2 text-slate-300"
            />

            <p className="text-sm text-slate-400">
              No learning activity yet.
            </p>

          </div>
        ) : (
          <div className="space-y-2">

            {analytics.recentLearning.map(
              (item) => (

                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-slate-50"
                >

                  {/* ICON */}

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50">

                    {item.type ===
                    "Summary" ? (
                      <FileText
                        size={18}
                        className="text-violet-600"
                      />
                    ) : (
                      <Search
                        size={18}
                        className="text-violet-600"
                      />
                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-medium text-slate-800">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.description}
                    </p>

                  </div>

                  {/* TIME */}

                  <span className="shrink-0 text-xs text-slate-400">
                    {formatRelativeTime(
                      item.time
                    )}
                  </span>

                </div>
              )
            )}

          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// RELATIVE TIME
// =====================================================

function formatRelativeTime(
  dateString: string
) {
  const date = new Date(
    dateString
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const now = new Date();

  const diffMs =
    now.getTime() -
    date.getTime();

  const diffMinutes =
    Math.floor(
      diffMs /
        (1000 * 60)
    );

  const diffHours =
    Math.floor(
      diffMs /
        (1000 * 60 * 60)
    );

  const diffDays =
    Math.floor(
      diffMs /
        (1000 * 60 * 60 * 24)
    );

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}
"use client";

import React, { useEffect, useState } from "react";
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

  const [progress, setProgress] = useState<ProgressData>({
    totalSearches: 0,
    totalSummaries: 0,
    savedSummaries: 0,
    timeSavedMinutes: 0,
    hoursSaved: 0,
  });

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    weeklyActivity: [],
    recentLearning: [],
    activityPercent: 0,
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD ANALYTICS
  // =====================================================

  useEffect(() => {
    if (!user) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        // =================================================
        // 1. GET SAME STATS USED BY DASHBOARD
        // =================================================

        const progressResponse = await fetch(
          `/api/progress?userId=${user.uid}`,
          {
            cache: "no-store",
          }
        );

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();

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
        // 2. GET WEEKLY + RECENT LEARNING
        // =================================================

        const firebaseUser = user as any;

        let token = "";

        if (firebaseUser?.getIdToken) {
          token = await firebaseUser.getIdToken();
        }

        const analyticsResponse = await fetch(
          "/api/analytics",
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
            cache: "no-store",
          }
        );

        if (analyticsResponse.ok) {
          const analyticsData =
            await analyticsResponse.json();

          if (analyticsData?.analytics) {
            setAnalytics({
              weeklyActivity:
                analyticsData.analytics.weeklyActivity || [],

              recentLearning:
                analyticsData.analytics.recentLearning || [],

              activityPercent:
                Number(
                  analyticsData.analytics.activityPercent || 0
                ),
            });
          }
        }
      } catch (error) {
        console.error(
          "Analytics loading error:",
          error
        );
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
    Number(progress.timeSavedMinutes || 0) / 60
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
          <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />

          <div className="h-4 w-64 bg-slate-200 rounded mt-2 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse"
            />
          ))}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* TOPICS EXPLORED */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-5">
            <BookOpen
              size={22}
              className="text-violet-600"
            />
          </div>

          <p className="text-sm text-slate-500">
            Topics Explored
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {progress.totalSearches}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Total topics
          </p>
        </div>

        {/* SUMMARIES */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-5">
            <BarChart3
              size={22}
              className="text-violet-600"
            />
          </div>

          <p className="text-sm text-slate-500">
            Summaries Generated
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {progress.totalSummaries}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            AI summaries
          </p>
        </div>

        {/* TIME SAVED */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-5">
            <Clock
              size={22}
              className="text-violet-600"
            />
          </div>

          <p className="text-sm text-slate-500">
            Time Saved
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {timeSavedHours}h
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Hours
          </p>
        </div>

        {/* SAVED ITEMS */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-5">
            <Bookmark
              size={22}
              className="text-violet-600"
            />
          </div>

          <p className="text-sm text-slate-500">
            Saved Items
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {progress.savedSummaries}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Total
          </p>
        </div>
      </div>

      {/* =================================================
          LEARNING ACTIVITY + LEARNING INSIGHTS
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* =================================================
            LEARNING ACTIVITY
        ================================================= */}

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Learning Activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your activity over the past week
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 text-violet-600 text-sm">
              <TrendingUp size={15} />
              This Week
            </div>
          </div>

          {/* CHART */}

          <div className="h-64">
            {analytics.weeklyActivity.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No activity this week yet.
              </div>
            ) : (
              <div className="h-full flex items-end justify-between gap-3 px-2">
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
                        className="flex-1 h-full flex flex-col items-center justify-end"
                      >
                        {/* VALUE */}

                        {item.value > 0 && (
                          <span className="text-xs text-slate-500 mb-2">
                            {item.value}
                          </span>
                        )}

                        {/* BAR */}

                        <div
                          className="w-full max-w-10 rounded-t-xl bg-violet-500 transition-all"
                          style={{
                            height: `${height}px`,
                          }}
                        />

                        {/* DAY */}

                        <span className="text-xs text-slate-400 mt-3">
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

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Learning Insights
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Your weekly progress
            </p>
          </div>

          {/* CIRCLE */}

          <div className="flex justify-center mb-6">
            <div
              className="relative w-36 h-36 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(
                  rgb(139 92 246) ${analytics.activityPercent}%,
                  rgb(245 243 255) ${analytics.activityPercent}% 100%
                )`,
              }}
            >
              <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center">
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
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Searches
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {progress.totalSearches}
                </span>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-400 rounded-full"
                  style={{
                    width: `${Math.min(
                      progress.totalSearches * 10,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* SUMMARIES */}

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Summaries
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {progress.totalSummaries}
                </span>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-400 rounded-full"
                  style={{
                    width: `${Math.min(
                      progress.totalSummaries * 10,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* SAVED */}

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Saved Items
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {progress.savedSummaries}
                </span>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-400 rounded-full"
                  style={{
                    width: `${Math.min(
                      progress.savedSummaries * 10,
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

      <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Learning
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Your latest searches and learning activity
          </p>
        </div>

        {analytics.recentLearning.length === 0 ? (
          <div className="py-8 text-center">
            <Search
              size={24}
              className="mx-auto text-slate-300 mb-2"
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
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition"
                >
                  {/* ICON */}

                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    {item.type === "Summary" ? (
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
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {item.title}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* TYPE */}

                  <span className="text-xs text-slate-400 shrink-0">
                    {item.type}
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
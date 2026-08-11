"use client";

import React, {
  useEffect,
  useState,
} from "react";

import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentSummaries from "@/components/dashboard/RecentSummaries";
import QuickSearch from "@/components/dashboard/QuickSearch";
import ActivityChart from "@/components/dashboard/ActivityChart";
import LearningBanner from "@/components/dashboard/LearningBanner";

import { useAuth } from "@/context/AuthProvider";

interface ProgressData {
  totalSearches: number;
  totalSummaries: number;
  savedSummaries: number;
  quizzesCompleted: number;
}

const DEFAULT_PROGRESS: ProgressData = {
  totalSearches: 0,
  totalSummaries: 0,
  savedSummaries: 0,
  quizzesCompleted: 0,
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [progress, setProgress] =
    useState<ProgressData>(
      DEFAULT_PROGRESS
    );

  useEffect(() => {
    const userId = user?.uid;

    if (!userId) {
      return;
    }

    let cancelled = false;

    const loadProgress = async () => {
      try {
        const response = await fetch(
          `/api/progress?userId=${encodeURIComponent(
            userId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch progress:",
            response.status
          );

          return;
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        setProgress({
          totalSearches: Number(
            data.totalSearches ?? 0
          ),

          totalSummaries: Number(
            data.totalSummaries ?? 0
          ),

          savedSummaries: Number(
            data.savedSummaries ?? 0
          ),

          quizzesCompleted: Number(
            data.quizzesCompleted ?? 0
          ),
        });
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Error loading progress:",
            error
          );
        }
      }
    };

    /*
     * Initial dashboard load.
     */
    void loadProgress();

    /*
     * Called after quiz completion.
     */
    const handleProgressUpdate = () => {
      void loadProgress();
    };

    window.addEventListener(
      "progress-updated",
      handleProgressUpdate
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "progress-updated",
        handleProgressUpdate
      );
    };
  }, [user?.uid]);

  return (
    <div className="space-y-6">

      {/* Statistics */}
      <StatsGrid
        totalSearches={
          progress.totalSearches
        }
        totalSummaries={
          progress.totalSummaries
        }
        savedSummaries={
          progress.savedSummaries
        }
        quizzesCompleted={
          progress.quizzesCompleted
        }
      />

      {/* Recent Summaries + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Summaries */}
        <div className="lg:col-span-2">
          <RecentSummaries />
        </div>

        {/* Right Side */}
        <div className="space-y-4">
          <QuickSearch />
          <ActivityChart />
        </div>
      </div>

      {/* Bottom Banner */}
      <LearningBanner />

    </div>
  );
}
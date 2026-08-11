"use client";

import React, { useEffect, useState } from "react";

import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentSummaries from "@/components/dashboard/RecentSummaries";
import QuickSearch from "@/components/dashboard/QuickSearch";
import ActivityChart from "@/components/dashboard/ActivityChart";
import LearningBanner from "@/components/dashboard/LearningBanner";

import { useAuth } from "@/context/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();

  const [progress, setProgress] = useState({
    totalSearches: 0,
    totalSummaries: 0,
    savedSummaries: 0,
    timeSavedMinutes: 0,
  });

  // Load dashboard stats
  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/progress?userId=${user.uid}`);

        if (!res.ok) return;

        const data = await res.json();

        setProgress(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProgress();
  }, [user]);

  // Refresh dashboard whenever progress changes
  useEffect(() => {
    const refresh = async () => {
      if (!user) return;

      try {
        const res = await fetch(`/api/progress?userId=${user.uid}`);

        if (!res.ok) return;

        const data = await res.json();

        setProgress(data);
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener("progress-updated", refresh);

    return () => {
      window.removeEventListener("progress-updated", refresh);
    };
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <StatsGrid
        totalSearches={progress.totalSearches}
        totalSummaries={progress.totalSummaries}
        savedSummaries={progress.savedSummaries}
        timeSavedMinutes={progress.timeSavedMinutes}
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
"use client";

import React from "react";
import {
  Bookmark,
  Sparkles,
  Search,
  Laptop,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentSummaries from "@/components/dashboard/RecentSummaries";
import QuickSearch from "@/components/dashboard/QuickSearch";
import ActivityChart from "@/components/dashboard/ActivityChart";
import LearningBanner from "@/components/dashboard/LearningBanner";



export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <StatsGrid />

      {/* Recent Summaries + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Summaries */}
        <div className="lg:col-span-2">
  <RecentSummaries />
</div>

        {/* Right Side */}
        <div className="space-y-4">
          <QuickSearch />

          {/* Activity */}
          <ActivityChart />
        </div>
      </div>

      {/* Bottom Banner */}
      <LearningBanner />
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

type UserAnalytics = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  searches: number;
  summaries: number;
  savedSummaries: number;
  lastActive?: string;
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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics");

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const result = await response.json();

        console.log("Analytics:", result);

        setData(result);
      } catch (error) {
        console.error("Analytics error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white p-8">
        <p className="text-red-500">Failed to load analytics.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics
        </h1>

        <p className="mt-2 text-gray-500">
          Monitor user activity and platform performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={data.stats.totalUsers}
        />

        <StatCard
          title="Total Searches"
          value={data.stats.totalSearches}
        />

        <StatCard
          title="Total Summaries"
          value={data.stats.totalSummaries}
        />

        <StatCard
          title="Saved Summaries"
          value={data.stats.totalSavedSummaries}
        />
      </div>

      {/* Users */}
      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          User Analytics
        </h2>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    User
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Email
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Searches
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Summaries
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Saved
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Last Active
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  data.users.map((user) => (
                    <tr
                      key={user.uid}
                      className="border-b border-gray-100 last:border-0"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                         {user.photoURL ? (
  <img
    src={user.photoURL}
    alt={user.name}
    className="h-9 w-9 rounded-full object-cover"
    onError={(e) => {
      e.currentTarget.style.display = "none";
      e.currentTarget.nextElementSibling?.classList.remove("hidden");
    }}
  />
) : null}

<div
  className={`${
    user.photoURL ? "hidden" : ""
  } flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600`}
>
  {user.name?.charAt(0)?.toUpperCase() || "U"}
</div>

                          <span className="font-medium text-gray-900">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>

                      {/* Searches */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.searches}
                      </td>

                      {/* Summaries */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.summaries}
                      </td>

                      {/* Saved */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.savedSummaries}
                      </td>

                      {/* Last Active */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.lastActive
                          ? new Date(
                              user.lastActive
                            ).toLocaleString()
                          : "Never"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}
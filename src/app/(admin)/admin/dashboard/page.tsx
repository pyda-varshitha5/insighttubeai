"use client";

import {
  Users,
  Search,
  FileText,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

const users = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    joined: "May 19, 2025",
    summaries: 12,
    searches: 28,
    active: "2 hours ago",
    status: "Active",
  },
  {
    name: "Rahul Verma",
    email: "rahul.verma@email.com",
    joined: "May 18, 2025",
    summaries: 8,
    searches: 19,
    active: "5 hours ago",
    status: "Active",
  },
  {
    name: "Aisha Khan",
    email: "aisha.khan@email.com",
    joined: "May 17, 2025",
    summaries: 15,
    searches: 34,
    active: "1 day ago",
    status: "Active",
  },
  {
    name: "Michael Brown",
    email: "michael.brown@email.com",
    joined: "May 16, 2025",
    summaries: 6,
    searches: 14,
    active: "2 days ago",
    status: "Inactive",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    joined: "May 15, 2025",
    summaries: 9,
    searches: 22,
    active: "3 days ago",
    status: "Inactive",
  },
];

const registrationData = [180, 230, 250, 290, 320, 360, 400];
const searchData = [1100, 950, 1020, 900, 1200, 980, 1450];
const summaryData = [420, 520, 470, 560, 590, 530, 700];

function MiniChart({
  data,
}: {
  data: number[];
}) {
  const width = 300;
  const height = 100;

  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;

      const y =
        height -
        ((value - min) / (max - min || 1)) * (height - 20) -
        10;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-28">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
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
          const x = (index / (data.length - 1)) * width;

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

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-2">
            {title}
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">
            {value}
          </h2>

          <p className="text-xs text-emerald-600 mt-2 font-medium">
            {change}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-7">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              InsightTube-AI
            </h1>

            <p className="text-sm text-violet-500 mt-1">
              Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600">
            <CalendarDays size={16} />
            May 19, 2025
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

          <StatCard
            title="Total Users"
            value="1,248"
            change="+12.5% from last week"
            icon={Users}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Total Searches"
            value="5,732"
            change="+18.3% from last week"
            icon={Search}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Summaries Generated"
            value="3,182"
            change="+15.7% from last week"
            icon={FileText}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Active Users (7 Days)"
            value="842"
            change="+10.2% from last week"
            icon={TrendingUp}
            iconClass="bg-orange-50 text-orange-500"
          />

        </div>

        {/* Users Overview */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-7 overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">
              Users Overview
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs">
                  <th className="text-left px-5 py-3 font-medium">
                    User
                  </th>

                  <th className="text-left px-5 py-3 font-medium">
                    Email
                  </th>

                  <th className="text-left px-5 py-3 font-medium">
                    Joined On
                  </th>

                  <th className="text-left px-5 py-3 font-medium">
                    Summaries
                  </th>

                  <th className="text-left px-5 py-3 font-medium">
                    Searches
                  </th>

                  <th className="text-left px-5 py-3 font-medium">
                    Last Active
                  </th>

                  <th className="text-left px-5 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.email}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {user.name}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500">
                      {user.email}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500">
                      {user.joined}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {user.summaries}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {user.searches}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500">
                      {user.active}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </section>

        {/* Analytics */}
        <section>
          <h2 className="font-semibold text-slate-900 mb-4">
            Analytics Overview
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-slate-500 mb-3">
                User Registrations{" "}
                <span className="text-slate-400">
                  (Last 7 Days)
                </span>
              </p>

              <MiniChart data={registrationData} />

              <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                <span>May 13</span>
                <span>May 19</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-slate-500 mb-3">
                Searches{" "}
                <span className="text-slate-400">
                  (Last 7 Days)
                </span>
              </p>

              <MiniChart data={searchData} />

              <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                <span>May 13</span>
                <span>May 19</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-slate-500 mb-3">
                Summaries Generated{" "}
                <span className="text-slate-400">
                  (Last 7 Days)
                </span>
              </p>

              <MiniChart data={summaryData} />

              <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                <span>May 13</span>
                <span>May 19</span>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
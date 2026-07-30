"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const ACTIVITY_DATA = [
  { day: "May 22", value: 4 },
  { day: "May 23", value: 9 },
  { day: "May 24", value: 5 },
  { day: "May 25", value: 11 },
  { day: "May 26", value: 7 },
  { day: "May 27", value: 14 },
  { day: "May 28", value: 10 },
];

export default function ActivityChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h2 className="font-semibold text-slate-900 mb-4">
        Your Activity
      </h2>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ACTIVITY_DATA}>
            <CartesianGrid
              stroke="#f1f5f9"
              vertical={false}
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              width={20}
              tick={{ fontSize: 10 }}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
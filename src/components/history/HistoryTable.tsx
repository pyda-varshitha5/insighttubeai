import { Bookmark, MoreVertical, FileText, Search } from "lucide-react";

interface HistoryRow {
  id: number;
  title: string;
  description: string;
  type: "Summary" | "Search";
  date: string;
  time: string;
  iconBg: string;
  iconText: string;
}

const HISTORY_ROWS: HistoryRow[] = [
  {
    id: 1,
    title: "React Hooks Tutorial – Full Course for Beginners",
    description:
      "Comprehensive summary of React Hooks with examples and best practices.",
    type: "Summary",
    date: "May 28, 2025",
    time: "10:45 AM",
    iconBg: "from-violet-100 to-violet-50",
    iconText: "text-violet-600",
  },
  {
    id: 2,
    title: "Python Full Course – Learn Python in 4 Hours",
    description:
      "Complete Python crash course covering basics to advanced concepts.",
    type: "Summary",
    date: "May 26, 2025",
    time: "08:30 PM",
    iconBg: "from-blue-100 to-blue-50",
    iconText: "text-blue-600",
  },
  {
    id: 3,
    title: "JavaScript Crash Course for Beginners",
    description: "Detailed overview of JavaScript fundamentals and key concepts.",
    type: "Summary",
    date: "May 24, 2025",
    time: "06:15 PM",
    iconBg: "from-yellow-100 to-yellow-50",
    iconText: "text-yellow-600",
  },
  {
    id: 4,
    title: "What is Artificial Intelligence? | Full Explanation",
    description:
      "In-depth explanation of AI, its types, applications, and future scope.",
    type: "Summary",
    date: "May 22, 2025",
    time: "11:20 AM",
    iconBg: "from-indigo-100 to-indigo-50",
    iconText: "text-indigo-600",
  },
  {
    id: 5,
    title: "SQL Tutorial for Beginners",
    description:
      "Learn SQL basics, queries, joins, and database management step by step.",
    type: "Summary",
    date: "May 20, 2025",
    time: "09:10 PM",
    iconBg: "from-sky-100 to-sky-50",
    iconText: "text-sky-600",
  },
  {
    id: 6,
    title: "Machine Learning Basics",
    description: "Search query",
    type: "Search",
    date: "May 19, 2025",
    time: "07:45 PM",
    iconBg: "from-slate-100 to-slate-50",
    iconText: "text-slate-500",
  },
];

function TypeBadge({ type }: { type: HistoryRow["type"] }) {
  const isSummary = type === "Summary";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
        isSummary
          ? "bg-violet-50 text-violet-600"
          : "bg-blue-50 text-blue-600"
      }`}
    >
      {isSummary ? (
        <FileText className="h-3.5 w-3.5" />
      ) : (
        <Search className="h-3.5 w-3.5" />
      )}
      {type}
    </span>
  );
}

export default function HistoryTable() {
  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Topic / Summary
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {HISTORY_ROWS.map((row, index) => (
              <tr
                key={row.id}
                className={`transition-all duration-200 hover:bg-violet-50/40 ${
                  index !== HISTORY_ROWS.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                {/* Topic / Summary */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${row.iconBg}`}
                    >
                      <FileText className={`h-5 w-5 ${row.iconText}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {row.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {row.description}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-5 align-middle">
                  <TypeBadge type={row.type} />
                </td>

                {/* Date */}
                <td className="px-6 py-5 align-middle">
                  <p className="text-sm font-medium text-slate-700">{row.date}</p>
                  <p className="text-xs text-slate-500">{row.time}</p>
                </td>

                {/* Actions */}
                <td className="px-6 py-5 align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="cursor-pointer rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-violet-600"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
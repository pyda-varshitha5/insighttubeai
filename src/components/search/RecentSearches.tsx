import { Search } from "lucide-react";

const RECENT_SEARCHES = [
  { id: 1, title: "React Hooks Tutorial", time: "2 hours ago" },
  { id: 2, title: "JavaScript Full Course", time: "1 day ago" },
  { id: 3, title: "Machine Learning Basics", time: "2 days ago" },
  { id: 4, title: "System Design Interview", time: "3 days ago" },
  { id: 5, title: "Python for Beginners", time: "4 days ago" },
];

export default function RecentSearches() {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
          Recent Searches
        </h3>
        <button
          type="button"
          className="text-xs font-medium text-violet-600 transition-colors hover:text-violet-700 sm:text-sm"
        >
          View all
        </button>
      </div>

      {/* List */}
      <ul className="divide-y divide-gray-100">
        {RECENT_SEARCHES.map((item) => (
          <li key={item.id}>
            <div className="flex items-center justify-between gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-gray-50 sm:px-2">
              <div className="flex min-w-0 items-center gap-3">
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate text-sm text-gray-700">
                  {item.title}
                </span>
              </div>
              <span className="shrink-0 text-xs text-gray-400 sm:text-sm">
                {item.time}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
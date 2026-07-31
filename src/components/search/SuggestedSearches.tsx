import { Search } from "lucide-react";

const SUGGESTED_SEARCHES = [
  { id: 1, title: "How does Blockchain work?" },
  { id: 2, title: "Explain HTTP vs HTTPS" },
  { id: 3, title: "Next.js 14 Crash Course" },
  { id: 4, title: "What is Generative AI?" },
  { id: 5, title: "SQL Tutorial for Beginners" },
];

export default function SuggestedSearches() {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
          You can try
        </h3>
      </div>

      {/* List */}
      <ul className="flex flex-col gap-2">
        {SUGGESTED_SEARCHES.map((item) => (
          <li key={item.id}>
            <div className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 transition-colors hover:bg-violet-50 sm:px-4">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate text-sm text-gray-700">
                {item.title}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
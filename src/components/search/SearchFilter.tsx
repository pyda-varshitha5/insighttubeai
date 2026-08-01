"use client";

import { Search } from "lucide-react";

interface SearchFilterProps {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
}

export default function SearchFilter({
  query,
  setQuery,
  onSearch,
}: SearchFilterProps) {
  return (
    <div className="flex justify-start">
<div className="flex w-full max-w-xl items-center rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">        <Search className="mr-2 h-4 w-4 text-gray-400" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
          placeholder="Search any topic..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />

        <button
          onClick={onSearch}
          className="ml-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          Search
        </button>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Sparkles, Search } from "lucide-react";

const POPULAR_SEARCHES = [
  "React Hooks",
  "Python Tutorial",
  "Data Structures",
  "Artificial Intelligence",
  "Productivity",
];

export default function SearchHero() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    console.log(trimmed);
  };

  const handleChipClick = (term: string) => {
    setQuery(term);
  };

  return (
    <div className="w-full">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find any topic on YouTube and get AI-powered summaries.
        </p>
      </div>

      {/* Hero card */}
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
            <Sparkles className="h-5 w-5 text-violet-600" />
          </div>

          <h2 className="mt-4 text-xl font-semibold text-gray-900 sm:text-2xl">
            What do you want to learn today?
          </h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Search any topic and get concise, AI-generated summaries from the
            best YouTube videos.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex w-full max-w-xl items-center rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm sm:p-2"
          >
            <Search className="ml-2 h-4 w-4 shrink-0 text-gray-400 sm:ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: React Hooks, Machine Learning, JavaScript Tutorial..."
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none sm:px-3 sm:text-base"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 sm:px-6"
            >
              Search
            </button>
          </form>

          {/* Popular searches */}
          <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-gray-500">Popular searches:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleChipClick(term)}
                className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-100"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon, Sparkles } from "lucide-react";

interface SearchHeroProps {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

const POPULAR_SEARCHES = [
  "React Hooks",
  "Python Tutorial",
  "Data Structures",
  "Artificial Intelligence",
  "Productivity",
];

export default function SearchHero({
  query,
  setQuery,
  onSearch,
  loading,
}: SearchHeroProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/youtube/suggestions?q=${encodeURIComponent(query)}`
        );

        const data = await res.json();

        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuggestions([]);

    onSearch();
  };

  const handlePopularClick = (term: string) => {
    setQuery(term);
    setSuggestions([]);
    onSearch();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
        <Sparkles className="h-5 w-5 text-purple-600" />
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">
        What do you want to learn today?
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Search any topic and get concise, AI-generated summaries from the
        best YouTube videos.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-6 flex max-w-2xl items-start gap-3"
      >
        <div className="relative flex-1">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3">
            <SearchIcon className="h-4 w-4 text-gray-400" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any topic..."
              className="w-full text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    setSuggestions([]);
                  }}
                  className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left text-sm hover:bg-violet-50 last:border-0"
                >
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-gray-500">
          Popular searches:
        </span>

        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => handlePopularClick(term)}
            className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600 transition hover:bg-purple-100"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Search } from "lucide-react";

const POPULAR_SEARCHES = [
  "React Hooks",
  "Python Tutorial",
  "Data Structures",
  "Artificial Intelligence",
  "Productivity",
];

export default function SearchHero() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const searchTopic = async (topic: string) => {
    if (!topic.trim()) return;

    setLoading(true);

    try {
      // Check API
      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(topic)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      // Read response once to verify API
      await response.json();

      // Navigate to results page
      router.push(`/search?q=${encodeURIComponent(topic)}`);
    } catch (err) {
      console.error(err);
      alert("Unable to fetch YouTube videos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("Button clicked");

  const trimmed = query.trim();

  if (!trimmed) {
    console.log("Empty query");
    return;
  }

  console.log("Searching:", trimmed);
};

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Search
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Find any topic on YouTube and get AI-powered summaries.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
            <Sparkles className="h-5 w-5 text-violet-600" />
          </div>

          <h2 className="mt-4 text-2xl font-semibold text-gray-900">
            What do you want to learn today?
          </h2>

          <p className="mt-2 max-w-md text-sm text-gray-500">
            Search any topic and get concise, AI-generated summaries from
            the best YouTube videos.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex w-full max-w-xl items-center rounded-xl border border-gray-200 bg-white p-2 shadow-sm"
          >
            <Search className="ml-3 h-5 w-5 text-gray-400" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: React Hooks, Machine Learning, JavaScript Tutorial..."
              className="flex-1 bg-transparent px-3 text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-violet-600 px-6 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-gray-500">
              Popular searches:
            </span>

            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  searchTopic(term);
                }}
                className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600 hover:bg-violet-100"
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
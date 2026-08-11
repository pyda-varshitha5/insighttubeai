"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import SearchHero from "./SearchHero";
import RecentSearches from "./RecentSearches";
import SuggestedSearches from "./SuggestedSearches";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  publishedAt: string;
  views: string;
  duration: string;
  url: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  /*
   * Search and open the results page
   */
  const handleSearch = useCallback(
    (searchTerm?: string) => {
      const q =
        typeof searchTerm === "string"
          ? searchTerm
          : query;

      const normalizedQuery = q.trim();

      if (!normalizedQuery) {
        return;
      }

      setLoading(true);

      /*
       * IMPORTANT:
       * Do NOT wait for Firebase user here.
       *
       * The results page/API can work without
       * userId, and waiting for Firebase was
       * preventing navigation.
       */
      router.push(
        `/search/results?q=${encodeURIComponent(
          normalizedQuery
        )}`
      );
    },
    [query, router]
  );

  /*
   * If the user opens:
   *
   * /search?q=React Hooks
   *
   * automatically send them to:
   *
   * /search/results?q=React Hooks
   */
  useEffect(() => {
    const q =
      searchParams.get("q") ||
      searchParams.get("topic");

    if (!q) {
      return;
    }

    const normalizedQuery = q.trim();

    if (!normalizedQuery) {
      return;
    }

    setQuery(normalizedQuery);
    setLoading(true);

    router.replace(
      `/search/results?q=${encodeURIComponent(
        normalizedQuery
      )}`
    );
  }, [searchParams, router]);

  return (
    <div className="w-full">

      {/* Search Hero */}
      <SearchHero
        query={query}
        setQuery={setQuery}
        onSearch={() => handleSearch()}
        loading={loading}
      />

      {/* Recent and Suggested Searches */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <RecentSearches
          onSelect={(text) => {
            setQuery(text);
            handleSearch(text);
          }}
        />

        <SuggestedSearches
          onSelect={(text) => {
            setQuery(text);
            handleSearch(text);
          }}
        />

      </div>
    </div>
  );
}
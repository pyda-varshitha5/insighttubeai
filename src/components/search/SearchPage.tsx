"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import SearchHero from "./SearchHero";
import RecentSearches from "./RecentSearches";
import SuggestedSearches from "./SuggestedSearches";

import { useAuth } from "@/context/AuthProvider";

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
  const { user } = useAuth();

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

      // Wait until Firebase user is available
      if (!user?.uid) {
        console.log("User not loaded yet. Search cancelled.");
        return;
      }

      setLoading(true);

      // Navigate to the separate results page
      router.push(
        `/search/results?q=${encodeURIComponent(
          normalizedQuery
        )}`
      );
    },
    [query, user?.uid, router]
  );

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
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import SearchHero from "./SearchHero";
import SearchResultsHeader from "./SearchResultsHeader";
import SearchActionCards from "./SearchActionCards";
import SearchFilter from "./SearchFilter";
import RecentSearches from "./RecentSearches";
import SuggestedSearches from "./SuggestedSearches";
import VideoTable from "./VideoTable";
import VideoPlayer from "./VideoPlayer";

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
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const { user } = useAuth();

  const lastSearchRef = useRef("");

  const handleSearch = useCallback(
    async (searchTerm?: string) => {
      const q =
        typeof searchTerm === "string"
          ? searchTerm
          : query;

      const normalizedQuery = q.trim().toLowerCase();

      if (!normalizedQuery) {
        return;
      }

      // Wait until Firebase user is available
      if (!user?.uid) {
        console.log("User not loaded yet. Search cancelled.");
        return;
      }

      // Prevent duplicate searches
      if (lastSearchRef.current === normalizedQuery) {
        console.log("Duplicate search skipped");
        return;
      }

      lastSearchRef.current = normalizedQuery;

      setLoading(true);

      try {
        const response = await fetch(
          `/api/youtube/search?q=${encodeURIComponent(
            q
          )}&userId=${encodeURIComponent(user.uid)}`
        );

        if (!response.ok) {
          let errorMessage = "Failed to fetch videos";

          try {
            const error = await response.json();

            console.error("API Error:", error);

            errorMessage =
              error?.error ||
              error?.message ||
              errorMessage;
          } catch {
            // Ignore JSON parsing error
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();

        console.log("API Response:", data);

        /*
         * Your API may return:
         *   [...]
         *
         * or:
         *   { videos: [...] }
         */
        const resultVideos: YouTubeVideo[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.videos)
          ? data.videos
          : [];

        console.log("Videos:", resultVideos);

        setQuery(q);
        setVideos(resultVideos);
        setSearched(true);

        // Update progress/recent learning elsewhere in the app
        window.dispatchEvent(new Event("progress-updated"));
      } catch (error) {
        console.error("Search error:", error);

        setVideos([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    },
    [query, user?.uid]
  );

  /*
   * Handle searches coming from URL:
   *
   * /search?q=react&results=true
   *
   * or:
   *
   * /search?topic=react&results=true
   */
  useEffect(() => {
    const topic =
      searchParams.get("q") ||
      searchParams.get("topic");

    const results = searchParams.get("results");

    if (
      topic &&
      results === "true" &&
      user?.uid
    ) {
      handleSearch(topic);
    }
  }, [
    searchParams,
    user?.uid,
    handleSearch,
  ]);

  return (
    <div className="w-full">
      {/* Search Hero */}
      <SearchHero
        query={query}
        setQuery={setQuery}
        onSearch={() => handleSearch()}
        loading={loading}
      />

      {!searched ? (
        <>
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
        </>
      ) : (
        <>
          {/* Search Results Header */}
          <div className="mt-6">
            <SearchResultsHeader
  query={query}
/>
          </div>

          {/* Search Action Cards */}
          <div className="mt-6">
            <SearchActionCards
              topic={query}
            />
          </div>

          {/* Search Filter */}
          <div className="mt-6">
            <SearchFilter
              query={query}
              setQuery={setQuery}
              onSearch={() => handleSearch()}
            />
          </div>

          {/* Search Results */}
          <div className="mt-6">
            <VideoTable
              videos={videos}
              loading={loading}
              onPlay={(videoId: string) => {
                setSelectedVideo(videoId);
              }}
            />
          </div>

          {/* Video Player */}
          <VideoPlayer
            videoId={selectedVideo ?? ""}
            open={selectedVideo !== null}
            onClose={() => {
              setSelectedVideo(null);
            }}
          />
        </>
      )}
    </div>
  );
}
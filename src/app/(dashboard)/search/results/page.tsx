"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import SearchResultsHeader from "@/components/search/SearchResultsHeader";
import SearchActionCards from "@/components/search/SearchActionCards";
import SearchFilter from "@/components/search/SearchFilter";
import VideoTable from "@/components/search/VideoTable";
import VideoPlayer from "@/components/search/VideoPlayer";

import { useAuth } from "@/context/AuthProvider";

interface YouTubeVideo {
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

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      const q = searchTerm.trim();

      if (!q) {
        return;
      }

      if (!user?.uid) {
        console.log("User not loaded yet.");
        return;
      }

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

            errorMessage =
              error?.error ||
              error?.message ||
              errorMessage;
          } catch {
            // Ignore JSON parsing errors
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();

        console.log("Results API response:", data);

        const resultVideos: YouTubeVideo[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.videos)
          ? data.videos
          : [];

        setQuery(q);
        setVideos(resultVideos);

        window.dispatchEvent(new Event("progress-updated"));
      } catch (error) {
        console.error("Search results error:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    },
    [user?.uid]
  );

  useEffect(() => {
    const q =
      searchParams.get("q") ||
      searchParams.get("topic");

    if (q && user?.uid) {
      setQuery(q);
      handleSearch(q);
    }
  }, [searchParams, user?.uid, handleSearch]);

  return (
    <div className="w-full">
      {/* Search Results Header */}
     {/* Results Header + Action Cards */}
<div className="mt-6 flex items-start justify-between gap-8">
  {/* Left: Results Heading */}
  <div className="min-w-0 flex-1">
    <SearchResultsHeader query={query} />
  </div>

  {/* Right: Action Cards */}
  <div className="shrink-0">
    <SearchActionCards topic={query} />
  </div>
</div>
      {/* Search Filter */}
      <div className="mt-6">
        <SearchFilter
          query={query}
          setQuery={setQuery}
          onSearch={() => handleSearch(query)}
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
    </div>
  );
}
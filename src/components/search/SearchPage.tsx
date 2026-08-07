"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import SearchHero from "./SearchHero";
import SearchResultsHeader from "./SearchResultsHeader";
import SearchActionCards from "./SearchActionCards";
import SearchFilter from "./SearchFilter";
import RecentSearches from "./RecentSearches";
import SuggestedSearches from "./SuggestedSearches";
import VideoTable from "./VideoTable";
import VideoPlayer from "./VideoPlayer";
import { useSearchParams } from "next/navigation";
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
 const handleSearch = useCallback(async (searchTerm?: string) => {
    
  const q =
  typeof searchTerm === "string"
    ? searchTerm
    : query;

const normalizedQuery = q.trim().toLowerCase();

if (!normalizedQuery) return;

// Prevent duplicate search
if (lastSearchRef.current === normalizedQuery) {
  console.log("Duplicate search skipped");
  return;
}

lastSearchRef.current = normalizedQuery;

    setLoading(true);

    try {
     const response = await fetch(
  `/api/youtube/search?q=${encodeURIComponent(q)}&userId=${user?.uid}`
);

       if (!response.ok) {
  const error = await response.json();

  console.error("API Error:", error);

  throw new Error(error.error || "Failed to fetch videos");
}

      const data = await response.json();

console.log("API Response:", data);
console.log("Videos:", data);

setQuery(q);
setVideos(data);
setSearched(true);

window.dispatchEvent(
  new Event("progress-updated")
);
    } catch (error) {
      console.error(error);
      setVideos([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [query]);
  useEffect(() => {
  const topic = searchParams.get("topic");
  const results = searchParams.get("results");

  if (topic && results === "true") {
    handleSearch(topic);
  }
}, [searchParams, handleSearch]);

  return (
    <div className="space-y-6">
      {!searched ? (
        <>
          <SearchHero
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            loading={loading}
          />

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
          <div className="flex items-start justify-between gap-6">

  <SearchResultsHeader query={query} />

  <SearchActionCards topic={query} />

</div>

<div className="mt-6">
  <SearchFilter
    query={query}
    setQuery={setQuery}
    onSearch={handleSearch}
  />
</div>

          <VideoTable
  videos={videos}
  loading={loading}
  onPlay={(id) => setSelectedVideo(id)}
/>

<VideoPlayer
  videoId={selectedVideo ?? ""}
  open={selectedVideo !== null}
  onClose={() => setSelectedVideo(null)}
/>
        </>
      )}
    </div>
  );
}
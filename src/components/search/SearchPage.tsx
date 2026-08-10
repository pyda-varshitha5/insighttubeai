"use client";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import SearchHero from "./SearchHero";
import SearchResultsHeader from "./SearchResultsHeader";
import SearchActionCards from "./SearchActionCards";
import RecentSearches from "./RecentSearches";
import SuggestedSearches from "./SuggestedSearches";
import VideoTable from "./VideoTable";
import VideoPlayer from "./VideoPlayer";

import { useSearchParams } from "next/navigation";

import { useAuth } from "@/context/AuthProvider";


// ======================================================
// YOUTUBE VIDEO TYPE
// ======================================================

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


// ======================================================
// SEARCH PAGE
// ======================================================

export default function SearchPage() {

  // ====================================================
  // STATE
  // ====================================================

  const [query, setQuery] =
    useState<string>("");

  const [videos, setVideos] =
    useState<YouTubeVideo[]>([]);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [searched, setSearched] =
    useState<boolean>(false);

  const [
    selectedVideo,
    setSelectedVideo,
  ] = useState<string | null>(null);


  // ====================================================
  // NEXT.JS SEARCH PARAMS
  // ====================================================

  const searchParams =
    useSearchParams();


  // ====================================================
  // AUTH
  // ====================================================

  const { user } = useAuth();


  // ====================================================
  // PREVENT DUPLICATE SEARCHES
  // ====================================================

  const lastSearchRef =
    useRef<string>("");


  // ====================================================
  // SEARCH FUNCTION
  // ====================================================

  async function handleSearch(
    searchTerm?: string
  ): Promise<void> {

    // --------------------------------------------------
    // GET SEARCH QUERY
    // --------------------------------------------------

    const q =
      typeof searchTerm === "string"
        ? searchTerm
        : query;


    // --------------------------------------------------
    // NORMALIZE QUERY
    // --------------------------------------------------

    const normalizedQuery =
      q.trim().toLowerCase();


    // --------------------------------------------------
    // EMPTY QUERY
    // --------------------------------------------------

    if (!normalizedQuery) {
      return;
    }


    // --------------------------------------------------
    // CHECK USER
    // --------------------------------------------------

    if (!user?.uid) {

      console.log(
        "User not loaded yet. Search cancelled."
      );

      return;
    }


    // --------------------------------------------------
    // PREVENT DUPLICATE SEARCH
    // --------------------------------------------------

    if (
      lastSearchRef.current ===
      normalizedQuery
    ) {

      console.log(
        "Duplicate search skipped"
      );

      return;
    }


    // --------------------------------------------------
    // SAVE LAST SEARCH
    // --------------------------------------------------

    lastSearchRef.current =
      normalizedQuery;


    // --------------------------------------------------
    // START LOADING
    // --------------------------------------------------

    setLoading(true);


    try {

      // =================================================
      // CALL YOUTUBE SEARCH API
      // =================================================

      const response =
        await fetch(
          `/api/youtube/search?q=${encodeURIComponent(
            q
          )}&userId=${encodeURIComponent(
            user.uid
          )}`
        );


      // =================================================
      // CHECK API RESPONSE
      // =================================================

      if (!response.ok) {

        let errorMessage =
          "Failed to fetch videos.";

        try {

          const errorData =
            await response.json();

          errorMessage =
            errorData?.error ||
            errorData?.message ||
            errorMessage;

        } catch {
          // Response was not JSON
        }


        console.error(
          "YouTube API Error:",
          errorMessage
        );


        throw new Error(
          errorMessage
        );
      }


      // =================================================
      // READ RESPONSE
      // =================================================

      const data =
        await response.json();


      console.log(
        "YouTube API Response:",
        data
      );


      // =================================================
      // NORMALIZE VIDEO DATA
      // =================================================

      const videoData: YouTubeVideo[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.videos)
            ? data.videos
            : [];


      // =================================================
      // UPDATE STATE
      // =================================================

      setQuery(q);

      setVideos(videoData);

      setSearched(true);


      // =================================================
      // UPDATE PROGRESS
      // =================================================

      if (
        typeof window !== "undefined"
      ) {

        window.dispatchEvent(
          new Event(
            "progress-updated"
          )
        );

      }

    } catch (error) {

      console.error(
        "Search error:",
        error
      );


      // ------------------------------------------------
      // SHOW EMPTY RESULTS
      // ------------------------------------------------

      setVideos([]);

      setSearched(true);

    } finally {

      // ------------------------------------------------
      // STOP LOADING
      // ------------------------------------------------

      setLoading(false);

    }
  }


  // ====================================================
  // SEARCH FROM URL
  // ====================================================

  useEffect(() => {

    const topic =
      searchParams.get("q") ||
      searchParams.get("topic");

    const results =
      searchParams.get("results");


    // --------------------------------------------------
    // ONLY RUN URL SEARCH WHEN:
    //
    // 1. topic exists
    // 2. results=true
    // 3. user is available
    // --------------------------------------------------

    if (
      !topic ||
      results !== "true" ||
      !user?.uid
    ) {
      return;
    }


    // --------------------------------------------------
    // RESET DUPLICATE SEARCH PROTECTION
    // --------------------------------------------------

    lastSearchRef.current = "";


    // --------------------------------------------------
    // RUN SEARCH AFTER EFFECT
    //
    // This avoids calling state updates directly
    // inside the effect body.
    // --------------------------------------------------

    const timer =
      window.setTimeout(() => {

        void handleSearch(topic);

      }, 0);


    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    return () => {

      window.clearTimeout(timer);

    };

    // handleSearch intentionally omitted because
    // it is a normal function and is recreated
    // on every render.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [
    searchParams,
    user?.uid,
  ]);


  // ====================================================
  // RECENT SEARCH HANDLER
  // ====================================================

  function handleRecentSearch(
    text: string
  ): void {

    const cleanText =
      text.trim();


    if (!cleanText) {
      return;
    }


    setQuery(cleanText);

    lastSearchRef.current = "";

    void handleSearch(cleanText);
  }


  // ====================================================
  // SUGGESTED SEARCH HANDLER
  // ====================================================

  function handleSuggestedSearch(
    text: string
  ): void {

    const cleanText =
      text.trim();


    if (!cleanText) {
      return;
    }


    setQuery(cleanText);

    lastSearchRef.current = "";

    void handleSearch(cleanText);
  }


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <div className="w-full">

      {/* ==================================================
          SEARCH HERO
          ================================================== */}

      <SearchHero
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        loading={loading}
      />


      {/* ==================================================
          SEARCH RESULTS HEADER
          ================================================== */}

      {searched && (

        <SearchResultsHeader
          query={query}
        />

      )}


      {/* ==================================================
          ACTION CARDS
          ================================================== */}

      {searched && (

        <SearchActionCards
          topic={query}
        />

      )}


      {/* ==================================================
          BEFORE SEARCH
          ================================================== */}

      {!searched ? (

        <div
          className="
            grid
            grid-cols-1
            gap-6
            lg:grid-cols-2
          "
        >

          {/* ==============================================
              RECENT SEARCHES
              ============================================== */}

          <RecentSearches
            onSelect={
              handleRecentSearch
            }
          />


          {/* ==============================================
              SUGGESTED SEARCHES
              ============================================== */}

          <SuggestedSearches
            onSelect={
              handleSuggestedSearch
            }
          />

        </div>

      ) : (

        /* =================================================
           AFTER SEARCH
           ================================================= */

        <>

          {/* ==============================================
              VIDEO TABLE
              ============================================== */}

          <VideoTable
            videos={videos}
            loading={loading}
            onPlay={(id) => {

              setSelectedVideo(id);

            }}
          />


          {/* ==============================================
              VIDEO PLAYER
              ============================================== */}

          <VideoPlayer
            videoId={
              selectedVideo ?? ""
            }

            open={
              selectedVideo !== null
            }

            onClose={() => {

              setSelectedVideo(null);

            }}
          />

        </>

      )}

    </div>

  );
}
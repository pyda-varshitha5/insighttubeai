import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import SearchCache from "../../../models/SearchCache";
import Progress from "../../../models/Progress";
import User from "@/models/User";

console.log("YOUTUBE SEARCH API LOADED");

const API_KEY = process.env.YOUTUBE_API_KEY;

console.log("API Key Loaded:", !!API_KEY);

// ============================================
// CAPITALIZE SEARCH QUERY
// ============================================

function capitalizeQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

// ============================================
// SEARCH YOUTUBE
// ============================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ==========================================
    // GET PARAMETERS
    // ==========================================

    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q");
    const userId = searchParams.get("userId");

    if (!query) {
      return NextResponse.json(
        {
          error: "Search query is required.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedQuery = query
      .trim()
      .toLowerCase();

    const displayQuery = capitalizeQuery(query);

    console.log("User ID:", userId);
    console.log("Query:", normalizedQuery);
    console.log("Display Query:", displayQuery);

    // ==========================================
    // UPDATE USER
    // ==========================================

    if (userId) {
      // ----------------------------------------
      // Update analytics
      // ----------------------------------------

      await User.findOneAndUpdate(
       {
  uid: userId,
  "recentSearches.query": { $ne: displayQuery },
},
        {
          $inc: {
            "analytics.totalSearches": 1,
          },
          $set: {
            "analytics.lastActive": new Date(),
          },
        }
      );

      console.log("User analytics updated");

      // ----------------------------------------
      // Save search history
      // ----------------------------------------
await User.findOneAndUpdate(
  {
    uid: userId,
    recentSearches: {
      $not: {
        $elemMatch: {
          query: displayQuery,
        },
      },
    },
  },
  {
    $push: {
      recentSearches: {
        query: displayQuery,
        createdAt: new Date(),
      },
    },
  }
);

      console.log(
        "Search history saved:",
        displayQuery
      );

      // ----------------------------------------
      // Update progress
      // ----------------------------------------

      let progress =
        await Progress.findOne({
          userId,
        });

      if (!progress) {
        progress = new Progress({
          userId,
          searchedTopics: [],
          totalSearches: 0,
          totalSummaries: 0,
          savedSummaries: 0,
          timeSavedMinutes: 0,
          quizzesCompleted: 0,
          streak: 0,
        });
      }

      console.log(
        "Before Update:",
        progress.searchedTopics
      );

      if (
        !progress.searchedTopics.includes(
          normalizedQuery
        )
      ) {
        progress.searchedTopics.push(
          normalizedQuery
        );
      }

      progress.totalSearches =
        progress.searchedTopics.length;

      await progress.save();

      console.log(
        "After Update:",
        progress.searchedTopics
      );

      console.log(
        "Total Searches:",
        progress.totalSearches
      );
    }

    // ==========================================
    // CHECK MONGODB CACHE
    // ==========================================

    const cached =
      await SearchCache.findOne({
        query: normalizedQuery,
      });

    if (cached) {
      console.log(
        "Returning cached results"
      );

      return NextResponse.json(
        cached.videos
      );
    }

    console.log(
      "Cache Miss:",
      normalizedQuery
    );

    // ==========================================
    // CHECK API KEY
    // ==========================================

    if (!API_KEY) {
      return NextResponse.json(
        {
          error:
            "YouTube API key is missing.",
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // SEARCH YOUTUBE
    // ==========================================

    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
        query
      )}&key=${API_KEY}`,
      {
        cache: "no-store",
      }
    );

    const searchData =
      await searchResponse.json();

    if (!searchResponse.ok) {
      return NextResponse.json(
        {
          error:
            searchData.error?.message ||
            "Failed to fetch videos",
        },
        {
          status: searchResponse.status,
        }
      );
    }

    // ==========================================
    // GET VIDEO IDS
    // ==========================================

    const ids = searchData.items
      .map(
        (item: {
          id: {
            videoId: string;
          };
        }) => item.id.videoId
      )
      .join(",");

    if (!ids) {
      return NextResponse.json([]);
    }

    // ==========================================
    // GET VIDEO STATISTICS
    // ==========================================

    const detailsResponse =
      await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${ids}&key=${API_KEY}`,
        {
          cache: "no-store",
        }
      );

    const detailsData =
      await detailsResponse.json();

    const detailsMap = new Map(
      detailsData.items.map(
        (item: {
          id: string;
          statistics: {
            viewCount: string;
          };
          contentDetails: {
            duration: string;
          };
        }) => [
          item.id,
          {
            views:
              item.statistics.viewCount,
            duration:
              item.contentDetails.duration,
          },
        ]
      )
    );

    // ==========================================
    // MERGE DATA
    // ==========================================

    const videos =
      searchData.items.map(
        (item: {
          id: {
            videoId: string;
          };
          snippet: {
            title: string;
            description: string;
            channelTitle: string;
            publishedAt: string;
            thumbnails: {
              high?: {
                url: string;
              };
              medium?: {
                url: string;
              };
            };
          };
        }) => {
          const extra =
            detailsMap.get(
              item.id.videoId
            );

          return {
            id: item.id.videoId,

            title:
              item.snippet.title,

            description:
              item.snippet.description,

            thumbnail:
              item.snippet.thumbnails.high
                ?.url ||
              item.snippet.thumbnails.medium
                ?.url,

            channel:
              item.snippet.channelTitle,

            publishedAt:
              item.snippet.publishedAt,

            views:
              (extra as any)?.views ||
              "0",

            duration:
              (extra as any)?.duration ||
              "",

            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          };
        }
      );

    // ==========================================
    // SAVE CACHE
    // ==========================================

    await SearchCache.findOneAndUpdate(
      {
        query: normalizedQuery,
      },
      {
        query: normalizedQuery,
        videos,
        createdAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log(
      "Saved results to MongoDB cache"
    );

    // ==========================================
    // RETURN VIDEOS
    // ==========================================

    return NextResponse.json(videos);
  } catch (error) {
    console.error(
      "API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown Error",
      },
      {
        status: 500,
      }
    );
  }
}
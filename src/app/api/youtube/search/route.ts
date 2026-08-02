import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import SearchCache from "../../../models/SearchCache";

const API_KEY = process.env.YOUTUBE_API_KEY;

console.log("API Key Loaded:", !!API_KEY);

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required." },
        { status: 400 }
      );
    }

    const normalizedQuery = query.toLowerCase().trim();

    // ==========================
    // Check MongoDB Cache
    // ==========================

    const cached = await SearchCache.findOne({
      query: normalizedQuery,
    });

    if (cached) {
      console.log("Returning cached results");
      return NextResponse.json(cached.videos);
    }
console.log("Cache Miss:", normalizedQuery);
    // ==========================
    // Check API Key
    // ==========================

    if (!API_KEY) {
      return NextResponse.json(
        { error: "YouTube API key is missing." },
        { status: 500 }
      );
    }

    // ==========================
    // Search Videos
    // ==========================

    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
        query
      )}&key=${API_KEY}`,
      {
        cache: "no-store",
      }
    );

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      return NextResponse.json(
        {
          error: searchData.error?.message || "Failed to fetch videos",
        },
        {
          status: searchResponse.status,
        }
      );
    }

    // ==========================
    // Get Video IDs
    // ==========================

    const ids = searchData.items
      .map((item: { id: { videoId: string } }) => item.id.videoId)
      .join(",");

    // ==========================
    // Get Statistics
    // ==========================

    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${ids}&key=${API_KEY}`,
      {
        cache: "no-store",
      }
    );

    const detailsData = await detailsResponse.json();

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
            views: item.statistics.viewCount,
            duration: item.contentDetails.duration,
          },
        ]
      )
    );

    // ==========================
    // Merge Data
    // ==========================

    const videos = searchData.items.map(
      (item: {
        id: { videoId: string };
        snippet: {
          title: string;
          description: string;
          channelTitle: string;
          publishedAt: string;
          thumbnails: {
            high?: { url: string };
            medium?: { url: string };
          };
        };
      }) => {
        const extra = detailsMap.get(item.id.videoId);

        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url,
          channel: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          views: (extra as any)?.views || "0",
          duration: (extra as any)?.duration || "",
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        };
      }
    );

    // ==========================
    // Save Cache
    // ==========================

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

    console.log("Saved results to MongoDB cache");

    return NextResponse.json(videos);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
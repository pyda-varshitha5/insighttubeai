import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required." },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: "YouTube API key is missing." },
        { status: 500 }
      );
    }

    // -----------------------------
    // Search Videos
    // -----------------------------

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

    // -----------------------------
    // Get IDs
    // -----------------------------

    const ids = searchData.items
      .map((item: { id: { videoId: string } }) => item.id.videoId)
      .join(",");

    // -----------------------------
    // Get Statistics
    // -----------------------------

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

    // -----------------------------
    // Merge Search + Statistics
    // -----------------------------

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
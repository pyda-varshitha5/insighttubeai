import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import User from "@/models/User";
import SearchCache from "@/app/models/SearchCache";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Find the logged-in user
    const user = await User.findOne(
      { uid: userId },
      {
        recentSearches: 1,
      }
    ).lean();

    if (!user) {
      return NextResponse.json({
        success: true,
        searches: [],
      });
    }

    // Get the most recent 4 searches
    const recentSearches = Array.isArray(user.recentSearches)
      ? [...user.recentSearches]
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
          .slice(0, 4)
      : [];

    // Get associated YouTube information
    const searches = await Promise.all(
      recentSearches.map(async (search: any) => {
        const normalizedQuery = String(search.query)
          .trim()
          .toLowerCase();

        const cached = await SearchCache.findOne(
          {
            query: normalizedQuery,
          },
          {
            videos: 1,
          }
        ).lean();

        const firstVideo =
          cached?.videos?.[0] || null;

        return {
          query: search.query,
          createdAt: search.createdAt,

          title:
            firstVideo?.title ||
            search.query,

          thumbnail:
            firstVideo?.thumbnail ||
            null,

          url:
            firstVideo?.url ||
            null,

          videoId:
            firstVideo?.id ||
            null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      searches,
    });
  } catch (error) {
    console.error(
      "Recent searches API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load recent searches",
      },
      { status: 500 }
    );
  }
}
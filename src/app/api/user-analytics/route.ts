import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/mongodb";
import User from "@/models/User";
import SavedSummary from "@/models/SavedSummary";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // ==========================================
    // 1. VERIFY FIREBASE AUTHENTICATION
    // ==========================================

    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const idToken = authorization.substring(7).trim();

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const uid = decodedToken.uid;

    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. CONNECT DATABASE
    // ==========================================

    await connectDB();

    // ==========================================
    // 3. GET LOGGED-IN USER
    // ==========================================

    const user = await User.findOne({ uid }).lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // 4. GET USER SEARCHES
    // ==========================================

    const recentSearches = Array.isArray(user.recentSearches)
      ? user.recentSearches
      : [];

    // ==========================================
    // 5. GET USER SAVED SUMMARIES
    // ==========================================

    const savedSummaries = await SavedSummary.find({
      userId: uid,
    })
      .sort({ createdAt: -1 })
      .lean();

    // ==========================================
    // 6. CURRENT WEEK
    //
    // SUNDAY -> SATURDAY
    // ==========================================

    const now = new Date();

    // Sunday = 0
    // Monday = 1
    // ...
    // Saturday = 6
    const currentDay = now.getDay();

    const sunday = new Date(now);

    sunday.setDate(
      now.getDate() - currentDay
    );

    sunday.setHours(0, 0, 0, 0);

    // ==========================================
    // 7. CREATE SUN -> SAT DATA
    // ==========================================

    const weeklyActivity = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);

      date.setDate(
        sunday.getDate() + i
      );

      date.setHours(0, 0, 0, 0);

      const dayStart = new Date(date);

      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(date);

      dayEnd.setHours(
        23,
        59,
        59,
        999
      );

      // ------------------------------------------
      // SEARCHES FOR THIS DAY
      // ------------------------------------------

      let searches = 0;

      for (const search of recentSearches) {
        if (!search) continue;

        const rawDate =
          search.createdAt ||
          search.updatedAt ||
          search.date ||
          search.timestamp;

        if (!rawDate) continue;

        const searchDate = new Date(rawDate);

        if (
          Number.isNaN(
            searchDate.getTime()
          )
        ) {
          continue;
        }

        if (
          searchDate >= dayStart &&
          searchDate <= dayEnd
        ) {
          searches++;
        }
      }

      // ------------------------------------------
      // SUMMARIES FOR THIS DAY
      // ------------------------------------------

      let summaries = 0;

      for (const summary of savedSummaries) {
        if (!summary) continue;

        const rawDate =
          summary.createdAt ||
          summary.updatedAt ||
          summary.date;

        if (!rawDate) continue;

        const summaryDate = new Date(
          rawDate
        );

        if (
          Number.isNaN(
            summaryDate.getTime()
          )
        ) {
          continue;
        }

        if (
          summaryDate >= dayStart &&
          summaryDate <= dayEnd
        ) {
          summaries++;
        }
      }

      // ------------------------------------------
      // TOTAL ACTIVITY
      // ------------------------------------------

      const value =
        searches + summaries;

      weeklyActivity.push({
        day: date.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        ),

        date: date
          .toISOString()
          .split("T")[0],

        searches,

        summaries,

        value,
      });
    }

    // ==========================================
    // 8. ACTIVITY TOTAL
    // ==========================================

    const weeklyTotal =
      weeklyActivity.reduce(
        (total, item) =>
          total + item.value,
        0
      );

    // ==========================================
    // 9. ACTIVITY PERCENT
    // ==========================================

    const activityPercent =
      weeklyTotal > 0
        ? Math.min(
            weeklyTotal * 10,
            100
          )
        : 0;

    // ==========================================
    // 10. RECENT LEARNING
    // ==========================================

    const recentLearning: any[] = [];

    // ------------------------------------------
    // SEARCHES
    // ------------------------------------------

    for (const search of recentSearches) {
      if (!search) continue;

      const rawDate =
        search.createdAt ||
        search.updatedAt ||
        search.date ||
        search.timestamp;

      if (!rawDate) continue;

      const date = new Date(rawDate);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        continue;
      }

      const topic =
        search.topic ||
        search.query ||
        search.title ||
        search.searchTerm ||
        "Search";

      recentLearning.push({
        id:
          `search-${date.getTime()}-${topic}`,

        title: topic,

        description:
          "Search query",

        type: "Search",

        time: date.toISOString(),
      });
    }

    // ------------------------------------------
    // SAVED SUMMARIES
    // ------------------------------------------

    for (const summary of savedSummaries) {
      if (!summary) continue;

      const rawDate =
        summary.createdAt ||
        summary.updatedAt ||
        summary.date;

      if (!rawDate) continue;

      const date = new Date(rawDate);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        continue;
      }

      const title =
        summary.title ||
        summary.topic ||
        summary.videoTitle ||
        "Saved Summary";

      recentLearning.push({
        id:
          `summary-${String(
            summary._id
          )}`,

        title,

        description:
          "Generated summary",

        type: "Summary",

        time: date.toISOString(),
      });
    }

    // ==========================================
    // 11. SORT RECENT LEARNING
    // ==========================================

    recentLearning.sort(
      (a, b) =>
        new Date(b.time).getTime() -
        new Date(a.time).getTime()
    );

    const latestLearning =
      recentLearning.slice(0, 10);

    // ==========================================
    // 12. RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

      analytics: {
        weeklyActivity,

        recentLearning:
          latestLearning,

        activityPercent,
      },
    });
  } catch (error: any) {
    console.error(
      "USER ANALYTICS API ERROR:",
      error
    );

    // ==========================================
    // FIREBASE AUTH ERRORS
    // ==========================================

    if (
      error?.code ===
        "auth/id-token-expired" ||
      error?.code ===
        "auth/id-token-revoked" ||
      error?.code ===
        "auth/invalid-id-token" ||
      error?.code ===
        "auth/argument-error"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid or expired authentication token",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // GENERAL ERROR
    // ==========================================

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to load user analytics",
      },
      { status: 500 }
    );
  }
}
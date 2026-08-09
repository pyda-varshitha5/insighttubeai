import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/mongodb";
import User from "@/models/User";
import SavedSummary from "@/models/SavedSummary";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ==========================================
    // VERIFY FIREBASE AUTH
    // ==========================================

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    const decodedToken = await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    // ==========================================
    // FIND CURRENT USER
    // ==========================================

    const user = await User.findOne({ uid }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // ==========================================
    // SEARCH DATA
    // ==========================================

    const searches = user.recentSearches || [];

    const totalSearches = searches.length;

    // ==========================================
    // SUMMARY DATA
    // ==========================================

    const summaries = await SavedSummary.find({
      userId: uid,
    })
      .sort({ createdAt: -1 })
      .lean();

    const totalSummaries = summaries.length;

    // ==========================================
    // UNIQUE TOPICS
    // ==========================================

    const topicMap = new Map<string, number>();

    searches.forEach((search: any) => {
      const query = String(search.query || "").trim();

      if (!query) return;

      const key = query.toLowerCase();

      topicMap.set(
        key,
        (topicMap.get(key) || 0) + 1
      );
    });

    const topics = Array.from(topicMap.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const totalTopics = topics.length;

    // ==========================================
    // TOPIC PERCENTAGES
    // ==========================================

    const maxTopicCount =
      topics.length > 0
        ? Math.max(...topics.map((topic) => topic.count))
        : 1;

    const topicAnalytics = topics
      .slice(0, 5)
      .map((topic) => ({
        name: topic.name,
        count: topic.count,
        percent: Math.round(
          (topic.count / maxTopicCount) * 100
        ),
      }));

    // ==========================================
    // LAST 7 DAYS ACTIVITY
    // ==========================================

    const today = new Date();

    const weeklyActivity = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - i);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const searchCount = searches.filter((search: any) => {
        if (!search.createdAt) return false;

        const createdAt = new Date(search.createdAt);

        return (
          createdAt >= date &&
          createdAt < nextDate
        );
      }).length;

      const summaryCount = summaries.filter((summary: any) => {
        if (!summary.createdAt) return false;

        const createdAt = new Date(summary.createdAt);

        return (
          createdAt >= date &&
          createdAt < nextDate
        );
      }).length;

      weeklyActivity.push({
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        date: date.toISOString().split("T")[0],
        searches: searchCount,
        summaries: summaryCount,
        value: searchCount + summaryCount,
      });
    }

    // ==========================================
    // RECENT LEARNING
    // ==========================================

    const recentSearchActivities = searches
      .map((search: any, index: number) => ({
        id: `search-${index}`,
        title: search.query || "Untitled Search",
        description: "Search query",
        type: "Search",
        createdAt: search.createdAt
          ? new Date(search.createdAt)
          : new Date(0),
      }));

    const recentSummaryActivities = summaries.map(
      (summary: any) => ({
        id: String(summary._id),
        title: summary.title || "Untitled Summary",
        description: "Generated summary",
        type: "Summary",
        createdAt: summary.createdAt
          ? new Date(summary.createdAt)
          : new Date(0),
      })
    );

    const recentLearning = [
      ...recentSearchActivities,
      ...recentSummaryActivities,
    ]
      .sort(
        (a, b) =>
          b.createdAt.getTime() -
          a.createdAt.getTime()
      )
      .slice(0, 5)
      .map((item) => ({
        ...item,
        time: item.createdAt.toISOString(),
      }));

    // ==========================================
    // TIME SAVED
    // ==========================================

    const hoursSaved = Number(user.hoursSaved || 0);

    // ==========================================
    // WEEKLY ACTIVITY
    // ==========================================

    const weeklyTotal = weeklyActivity.reduce(
      (total, day) => total + day.value,
      0
    );

    // Activity percentage is based on weekly activity.
    // 20 activities/week = 100%.
    const activityPercent = Math.min(
      100,
      Math.round((weeklyTotal / 20) * 100)
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

     analytics: {
  topicsExplored: totalTopics,

  summariesGenerated: totalSummaries,

  searches: totalSearches,

  timeSaved: hoursSaved,

  savedItems: totalSummaries,

  activityPercent,

  weeklyActivity,

  topics: topicAnalytics,

  recentLearning,
},
    });
  } catch (error) {
    console.error("ANALYTICS API ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load analytics",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/mongodb";
import User from "@/models/User";
import Progress from "../../models/Progress";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // =========================================================
    // 1. CONNECT TO DATABASE
    // =========================================================

    await connectDB();

    // =========================================================
    // 2. VERIFY FIREBASE ADMIN AUTHENTICATION
    // =========================================================

    const authorization = req.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const token = authorization.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing authentication token",
        },
        { status: 401 }
      );
    }

    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error("Firebase token verification failed:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication token",
        },
        { status: 401 }
      );
    }

    // =========================================================
    // 3. CHECK WHETHER LOGGED-IN USER IS ADMIN
    // =========================================================

    const adminUser = await User.findOne({
      $or: [
        { uid: decodedToken.uid },
        { email: decodedToken.email },
      ],
    }).lean();

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin user not found",
        },
        { status: 403 }
      );
    }

    // Your existing admin field may exist on the User document.
    // If your Firebase custom claims contain admin=true, this also
    // allows that.
    const isAdmin =
      (adminUser as any).isAdmin === true ||
      (decodedToken as any).isAdmin === true ||
      (decodedToken as any).admin === true;

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    // =========================================================
    // 4. GET ALL USERS
    // =========================================================

    const users = await User.find({})
      .sort({ createdAt: 1 })
      .lean();

    // =========================================================
    // 5. GET ALL PROGRESS
    //
    // IMPORTANT:
    // This is the SAME Progress collection used by:
    //
    // /api/progress?userId=...
    //
    // Therefore admin values will match dashboard values.
    // =========================================================

    const allProgress = await Progress.find({}).lean();

    // Create a quick lookup:
    // userId -> Progress document
    const progressMap = new Map<string, any>();

    for (const progress of allProgress) {
      if (progress.userId) {
        progressMap.set(String(progress.userId), progress);
      }
    }

    // =========================================================
    // 6. BUILD USER ANALYTICS
    // =========================================================

    const userAnalytics = users.map((user: any) => {
      const userProgress = progressMap.get(String(user.uid));

      // Dashboard values
      const searches = Number(
        userProgress?.totalSearches ?? 0
      );

      const summaries = Number(
        userProgress?.totalSummaries ?? 0
      );

      const savedSummaries = Number(
        userProgress?.savedSummaries ?? 0
      );

      const timeSavedMinutes = Number(
        userProgress?.timeSavedMinutes ?? 0
      );

      const quizzesCompleted = Number(
        userProgress?.quizzesCompleted ?? 0
      );

      const streak = Number(
        userProgress?.streak ?? 0
      );

      // Last active:
      // Prefer Progress.lastActive if it exists.
      // Otherwise use User.updatedAt.
      const lastActive =
        userProgress?.lastActive ??
        user.updatedAt ??
        user.createdAt ??
        null;

      return {
        uid: user.uid,

        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",

        name:
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
          user.email?.split("@")[0] ||
          "User",

        email: user.email ?? "",

        photoURL: user.photoURL ?? "",

        // FIRST JOINING DATE
        // This comes from User.createdAt.
        // It does NOT change when the user logs in again.
        joinedOn: user.createdAt ?? null,

        createdAt: user.createdAt ?? null,
        updatedAt: user.updatedAt ?? null,

        // =====================================================
        // EXACT DASHBOARD VALUES
        // =====================================================

        searches,

        summaries,

        savedSummaries,

        timeSavedMinutes,

        timeSavedHours: Number(
          (timeSavedMinutes / 60).toFixed(1)
        ),

        quizzesCompleted,

        streak,

        lastActive,

        status: lastActive
          ? "Active"
          : "Inactive",
      };
    });

    // =========================================================
    // 7. OVERALL TOTALS
    // =========================================================

    const totalUsers = userAnalytics.length;

    const totalSearches = userAnalytics.reduce(
      (total, user) => total + user.searches,
      0
    );

    const totalSummaries = userAnalytics.reduce(
      (total, user) => total + user.summaries,
      0
    );

    const totalSavedSummaries = userAnalytics.reduce(
      (total, user) => total + user.savedSummaries,
      0
    );

    const totalTimeSavedMinutes = userAnalytics.reduce(
      (total, user) => total + user.timeSavedMinutes,
      0
    );

    const totalQuizzesCompleted = userAnalytics.reduce(
      (total, user) => total + user.quizzesCompleted,
      0
    );

    // =========================================================
    // 8. USER REGISTRATIONS
    // =========================================================

    const registrationMap = new Map<string, number>();

    for (const user of users as any[]) {
      if (!user.createdAt) continue;

      const date = new Date(user.createdAt);

      const key = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      registrationMap.set(
        key,
        (registrationMap.get(key) ?? 0) + 1
      );
    }

    const registrations = Array.from(
      registrationMap.entries()
    ).map(([date, count]) => ({
      date,
      count,
    }));

    // =========================================================
    // 9. SEARCHES BY USER
    // =========================================================

    const searchesByUser = userAnalytics.map((user) => ({
      uid: user.uid,
      name: user.name,
      email: user.email,
      searches: user.searches,
    }));

    // =========================================================
    // 10. SUMMARIES BY USER
    // =========================================================

    const summariesByUser = userAnalytics.map((user) => ({
      uid: user.uid,
      name: user.name,
      email: user.email,
      summaries: user.summaries,
    }));

    // =========================================================
    // 11. DAILY SEARCH/SUMMARY DATA
    //
    // Uses createdAt from actual Progress activity arrays when
    // available.
    // =========================================================

    const activityMap = new Map<
      string,
      {
        searches: number;
        summaries: number;
      }
    >();

    for (const progress of allProgress as any[]) {
      const searchedTopics = Array.isArray(
        progress.searchedTopics
      )
        ? progress.searchedTopics
        : [];

      const generatedSummaries = Array.isArray(
        progress.generatedSummaries
      )
        ? progress.generatedSummaries
        : [];

      // If arrays only contain strings, we cannot know the
      // exact date of every old activity.
      //
      // So we don't invent dates here.
      // Dashboard totals remain the source of truth.
      void searchedTopics;
      void generatedSummaries;
    }

    // =========================================================
    // 12. RESPONSE
    // =========================================================

    return NextResponse.json({
      success: true,

      overview: {
        totalUsers,

        totalSearches,

        totalSummaries,

        totalSavedSummaries,

        totalTimeSavedMinutes,

        totalTimeSavedHours: Number(
          (totalTimeSavedMinutes / 60).toFixed(1)
        ),

        totalQuizzesCompleted,
      },

      // Main users table
      users: userAnalytics,

      // Keep this name because your existing admin page
      // appears to use userAnalytics.
      userAnalytics,

      // Charts
      registrations,

      userRegistrations: registrations,

      searchesByUser,

      summariesByUser,

      // Raw progress can be useful for debugging.
      // Only the values required by the admin dashboard are exposed.
      progress: userAnalytics.map((user) => ({
        uid: user.uid,
        totalSearches: user.searches,
        totalSummaries: user.summaries,
        savedSummaries: user.savedSummaries,
        timeSavedMinutes: user.timeSavedMinutes,
        quizzesCompleted: user.quizzesCompleted,
        streak: user.streak,
        lastActive: user.lastActive,
      })),
    });
  } catch (error) {
    console.error("ADMIN ANALYTICS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
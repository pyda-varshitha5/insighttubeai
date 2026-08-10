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

    const email = decodedToken.email?.toLowerCase();

    // ==========================================
    // 2. VERIFY ADMIN
    // ==========================================

    const adminEmail1 =
      process.env.ADMIN_EMAIL_1?.trim().toLowerCase();

    const adminEmail2 =
      process.env.ADMIN_EMAIL_2?.trim().toLowerCase();

    const isAdmin =
      !!email &&
      (
        email === adminEmail1 ||
        email === adminEmail2
      );

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access denied",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // 3. CONNECT TO MONGODB
    // ==========================================

    await connectDB();

    // ==========================================
    // 4. GET ALL USERS
    // ==========================================

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .lean();

    // ==========================================
    // 5. GET ALL SAVED SUMMARIES
    // ==========================================

    const savedSummaries = await SavedSummary.find({})
      .sort({ createdAt: -1 })
      .lean();

    // ==========================================
    // 6. PLATFORM TOTALS
    // ==========================================

    const totalUsers = users.length;

    const totalSearches = users.reduce(
      (total: number, user: any) => {
        const recentSearches = Array.isArray(
          user.recentSearches
        )
          ? user.recentSearches
          : [];

        return total + recentSearches.length;
      },
      0
    );

    const totalSummaries = savedSummaries.length;

    const totalSavedSummaries = savedSummaries.length;

    // ==========================================
    // 7. CREATE USER ANALYTICS
    // ==========================================

    const userAnalytics = users.map((user: any) => {
      const recentSearches = Array.isArray(
        user.recentSearches
      )
        ? user.recentSearches
        : [];

      // Summaries belonging to this user
      const userSummaries = savedSummaries.filter(
        (summary: any) =>
          String(summary.userId) === String(user.uid)
      );

      // ========================================
      // FIND LAST SEARCH
      // ========================================

      let latestSearchDate: Date | null = null;

      for (const search of recentSearches) {
        if (!search?.createdAt) continue;

        const date = new Date(search.createdAt);

        if (Number.isNaN(date.getTime())) continue;

        if (
          !latestSearchDate ||
          date.getTime() > latestSearchDate.getTime()
        ) {
          latestSearchDate = date;
        }
      }

      // ========================================
      // FIND LAST SUMMARY
      // ========================================

      let latestSummaryDate: Date | null = null;

      for (const summary of userSummaries) {
        if (!summary?.createdAt) continue;

        const date = new Date(summary.createdAt);

        if (Number.isNaN(date.getTime())) continue;

        if (
          !latestSummaryDate ||
          date.getTime() > latestSummaryDate.getTime()
        ) {
          latestSummaryDate = date;
        }
      }

      // ========================================
      // DETERMINE LAST ACTIVE
      // ========================================

      let lastActive: Date | undefined;

      if (
        latestSearchDate &&
        latestSummaryDate
      ) {
        lastActive =
          latestSearchDate.getTime() >
          latestSummaryDate.getTime()
            ? latestSearchDate
            : latestSummaryDate;
      } else if (latestSearchDate) {
        lastActive = latestSearchDate;
      } else if (latestSummaryDate) {
        lastActive = latestSummaryDate;
      } else if (user.updatedAt) {
        const updatedDate = new Date(user.updatedAt);

        if (!Number.isNaN(updatedDate.getTime())) {
          lastActive = updatedDate;
        }
      }

      // ========================================
      // USER NAME
      // ========================================

      const fullName = [
        user.firstName,
        user.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      const name =
        user.name ||
        fullName ||
        user.displayName ||
        "Unknown User";

      // ========================================
      // USER UID
      // ========================================

      const uid =
        user.uid ||
        String(user._id);

      // ========================================
      // PHOTO
      // ========================================

      const photoURL =
        user.photoURL ||
        user.profilePicture ||
        user.image ||
        undefined;

      // ========================================
      // CREATED DATE
      // ========================================

      let createdAt: string | undefined;

      if (user.createdAt) {
        const createdDate = new Date(user.createdAt);

        if (!Number.isNaN(createdDate.getTime())) {
          createdAt = createdDate.toISOString();
        }
      }

      // ========================================
      // RETURN USER ANALYTICS
      // ========================================

      return {
        uid,
        name,
        email: user.email || "",
        photoURL,

        searches: recentSearches.length,

        summaries: userSummaries.length,

        savedSummaries: userSummaries.length,

        lastActive: lastActive
          ? lastActive.toISOString()
          : undefined,

        createdAt,
      };
    });

    // ==========================================
    // 8. FINAL RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

      stats: {
        totalUsers,
        totalSearches,
        totalSummaries,
        totalSavedSummaries,
      },

      users: userAnalytics,
    });
  } catch (error: any) {
    console.error(
      "ANALYTICS API ERROR:",
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
          "Failed to load analytics",
      },
      { status: 500 }
    );
  }
}
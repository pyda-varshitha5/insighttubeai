import { NextRequest, NextResponse } from "next/server";
import { DecodedIdToken } from "firebase-admin/auth";

import connectDB from "@/app/lib/mongodb";
import User from "@/models/User";
import Progress from "@/app/models/Progress";
import { adminAuth } from "@/lib/firebaseAdmin";

interface UserDocument {
  uid?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

interface ProgressDocument {
  userId?: string;
  totalSearches?: number;
  totalSummaries?: number;
  savedSummaries?: number;
  timeSavedMinutes?: number;
  quizzesCompleted?: number;
  streak?: number;
  lastActive?: Date | string | null;
}

interface AnalyticsToken extends DecodedIdToken {
  isAdmin?: boolean;
  admin?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    // ---------------------------------------------------------
    // 1. CONNECT TO DATABASE
    // ---------------------------------------------------------

    await connectDB();

    // ---------------------------------------------------------
    // 2. GET FIREBASE AUTH TOKEN
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // 3. VERIFY FIREBASE TOKEN
    // ---------------------------------------------------------

    let decodedToken: AnalyticsToken;

    try {
      decodedToken = (await adminAuth.verifyIdToken(
        token
      )) as AnalyticsToken;
    } catch (error) {
      console.error(
        "Firebase token verification failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication token",
        },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID not found",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // 4. FIND CURRENT USER
    // ---------------------------------------------------------

    const userResult = await User.findOne({
      $or: [
        { uid: uid },
        ...(email ? [{ email: email }] : []),
      ],
    }).lean();

    if (!userResult) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const user = userResult as unknown as UserDocument;

    // ---------------------------------------------------------
    // 5. GET CURRENT USER'S PROGRESS
    // ---------------------------------------------------------

    const progressResult = await Progress.findOne({
      userId: uid,
    }).lean();

    const progress =
      progressResult as unknown as ProgressDocument | null;

    // ---------------------------------------------------------
    // 6. DASHBOARD STATISTICS
    // ---------------------------------------------------------

    const totalSearches = Number(
      progress?.totalSearches ?? 0
    );

    const totalSummaries = Number(
      progress?.totalSummaries ?? 0
    );

    const savedSummaries = Number(
      progress?.savedSummaries ?? 0
    );

    const timeSavedMinutes = Number(
      progress?.timeSavedMinutes ?? 0
    );

    const timeSavedHours = Number(
      (timeSavedMinutes / 60).toFixed(1)
    );

    const quizzesCompleted = Number(
      progress?.quizzesCompleted ?? 0
    );

    const streak = Number(
      progress?.streak ?? 0
    );

    // ---------------------------------------------------------
    // 7. LAST ACTIVE
    // ---------------------------------------------------------

    const lastActive =
      progress?.lastActive ??
      user.updatedAt ??
      user.createdAt ??
      null;

    // ---------------------------------------------------------
    // 8. USER NAME
    // ---------------------------------------------------------

    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";

    const fallbackName =
      user.email?.split("@")[0] ?? "User";

    const name =
      `${firstName} ${lastName}`.trim() ||
      fallbackName;

    // ---------------------------------------------------------
    // 9. USER ANALYTICS OBJECT
    // ---------------------------------------------------------

    const userAnalytics = {
      uid: uid,

      firstName: firstName,

      lastName: lastName,

      name: name,

      email:
        user.email ??
        decodedToken.email ??
        "",

      photoURL:
        user.photoURL ??
        "",

      joinedOn:
        user.createdAt ?? null,

      createdAt:
        user.createdAt ?? null,

      updatedAt:
        user.updatedAt ?? null,

      searches: totalSearches,

      summaries: totalSummaries,

      savedSummaries: savedSummaries,

      timeSavedMinutes: timeSavedMinutes,

      timeSavedHours: timeSavedHours,

      quizzesCompleted: quizzesCompleted,

      streak: streak,

      lastActive: lastActive,

      status: lastActive
        ? "Active"
        : "Inactive",
    };

    // ---------------------------------------------------------
    // 10. RESPONSE
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,

      // Current user's overview
      overview: {
        totalSearches,
        totalSummaries,
        totalSavedSummaries: savedSummaries,
        totalTimeSavedMinutes: timeSavedMinutes,
        totalTimeSavedHours: timeSavedHours,
        totalQuizzesCompleted: quizzesCompleted,
        streak,
      },

      // Current user
      user: userAnalytics,

      // Keep this for compatibility
      userAnalytics,

      // Progress object
      progress: {
        uid: uid,

        totalSearches,

        totalSummaries,

        savedSummaries,

        timeSavedMinutes,

        quizzesCompleted,

        streak,

        lastActive,
      },

      // Also provide direct values
      totalSearches,

      totalSummaries,

      savedSummaries,

      timeSavedMinutes,

      timeSavedHours,

      quizzesCompleted,

      streak,

      lastActive,
    });
  } catch (error) {
    console.error(
      "USER ANALYTICS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
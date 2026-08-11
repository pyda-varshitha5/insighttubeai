import { NextRequest, NextResponse } from "next/server";
import { DecodedIdToken } from "firebase-admin/auth";

import connectDB from "@/app/lib/mongodb";
import User from "@/models/User";
import Progress from "@/app/models/Progress";
import { adminAuth } from "@/lib/firebaseAdmin";

/*
 * ---------------------------------------------------------
 * TYPES
 * ---------------------------------------------------------
 */

interface UserDocument {
  uid?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  isAdmin?: boolean;
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

interface AdminDecodedToken extends DecodedIdToken {
  isAdmin?: boolean;
  admin?: boolean;
}

interface UserAnalytics {
  uid: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  photoURL: string;

  joinedOn: Date | string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;

  searches: number;
  summaries: number;
  savedSummaries: number;
  timeSavedMinutes: number;
  timeSavedHours: number;
  quizzesCompleted: number;
  streak: number;

  lastActive: Date | string | null;
  status: "Active" | "Inactive";
}

/*
 * ---------------------------------------------------------
 * GET /api/analytics
 * ---------------------------------------------------------
 */

export async function GET(req: NextRequest) {
  try {
    /*
     * =======================================================
     * 1. CONNECT TO DATABASE
     * =======================================================
     */

    await connectDB();

    /*
     * =======================================================
     * 2. VERIFY FIREBASE ADMIN AUTHENTICATION
     * =======================================================
     */

    const authorization = req.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const token = authorization.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing authentication token",
        },
        {
          status: 401,
        }
      );
    }

    let decodedToken: AdminDecodedToken;

    try {
      decodedToken = (await adminAuth.verifyIdToken(
        token
      )) as AdminDecodedToken;
    } catch (error: unknown) {
      console.error("Firebase token verification failed:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication token",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * =======================================================
     * 3. CHECK WHETHER LOGGED-IN USER IS ADMIN
     * =======================================================
     */

    const adminUserResult = await User.findOne({
      $or: [
        {
          uid: decodedToken.uid,
        },
        {
          email: decodedToken.email,
        },
      ],
    }).lean();

    if (!adminUserResult) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin user not found",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Convert the MongoDB result into our known shape.
     *
     * The User model can have additional properties, but
     * analytics only needs the fields declared above.
     */
    const adminUser =
      adminUserResult as unknown as UserDocument;

    const isAdmin =
      adminUser.isAdmin === true ||
      decodedToken.isAdmin === true ||
      decodedToken.admin === true;

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * =======================================================
     * 4. GET ALL USERS
     * =======================================================
     */

    const usersResult = await User.find({})
      .sort({
        createdAt: 1,
      })
      .lean();

    const users =
      usersResult as unknown as UserDocument[];

    /*
     * =======================================================
     * 5. GET ALL PROGRESS
     *
     * This is the same Progress collection used by:
     *
     * /api/progress?userId=...
     *
     * Therefore admin analytics will use the same values
     * displayed on the user's dashboard.
     * =======================================================
     */

    const progressResult = await Progress.find({}).lean();

    const allProgress =
      progressResult as unknown as ProgressDocument[];

    /*
     * Create a quick lookup:
     *
     * userId -> Progress document
     */

    const progressMap =
      new Map<string, ProgressDocument>();

    for (const progress of allProgress) {
      if (progress.userId) {
        progressMap.set(
          String(progress.userId),
          progress
        );
      }
    }

    /*
     * =======================================================
     * 6. BUILD USER ANALYTICS
     * =======================================================
     */

    const userAnalytics: UserAnalytics[] = users.map(
      (user) => {
        const uid = String(user.uid ?? "");

        const userProgress =
          progressMap.get(uid);

        /*
         * Dashboard values
         */

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

        /*
         * Last active:
         *
         * Prefer Progress.lastActive.
         * Otherwise use User.updatedAt.
         * Otherwise use User.createdAt.
         */

        const lastActive =
          userProgress?.lastActive ??
          user.updatedAt ??
          user.createdAt ??
          null;

        /*
         * User name
         */

        const firstName =
          user.firstName ?? "";

        const lastName =
          user.lastName ?? "";

        const fallbackName =
          user.email?.split("@")[0] ??
          "User";

        const name =
          `${firstName} ${lastName}`.trim() ||
          fallbackName;

        return {
          uid,

          firstName,

          lastName,

          name,

          email:
            user.email ?? "",

          photoURL:
            user.photoURL ?? "",

          /*
           * FIRST JOINING DATE
           *
           * This comes from User.createdAt.
           * It does not change when the user logs in again.
           */

          joinedOn:
            user.createdAt ?? null,

          createdAt:
            user.createdAt ?? null,

          updatedAt:
            user.updatedAt ?? null,

          /*
           * EXACT DASHBOARD VALUES
           */

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
      }
    );

    /*
     * =======================================================
     * 7. OVERALL TOTALS
     * =======================================================
     */

    const totalUsers =
      userAnalytics.length;

    const totalSearches =
      userAnalytics.reduce(
        (total, user) =>
          total + user.searches,
        0
      );

    const totalSummaries =
      userAnalytics.reduce(
        (total, user) =>
          total + user.summaries,
        0
      );

    const totalSavedSummaries =
      userAnalytics.reduce(
        (total, user) =>
          total + user.savedSummaries,
        0
      );

    const totalTimeSavedMinutes =
      userAnalytics.reduce(
        (total, user) =>
          total + user.timeSavedMinutes,
        0
      );

    const totalQuizzesCompleted =
      userAnalytics.reduce(
        (total, user) =>
          total + user.quizzesCompleted,
        0
      );

    /*
     * =======================================================
     * 8. USER REGISTRATIONS
     * =======================================================
     */

    const registrationMap =
      new Map<string, number>();

    for (const user of users) {
      if (!user.createdAt) {
        continue;
      }

      const date =
        new Date(user.createdAt);

      const key =
        date.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

      registrationMap.set(
        key,
        (registrationMap.get(key) ?? 0) + 1
      );
    }

    const registrations =
      Array.from(
        registrationMap.entries()
      ).map(
        ([date, count]) => ({
          date,
          count,
        })
      );

    /*
     * =======================================================
     * 9. SEARCHES BY USER
     * =======================================================
     */

    const searchesByUser =
      userAnalytics.map(
        (user) => ({
          uid: user.uid,
          name: user.name,
          email: user.email,
          searches: user.searches,
        })
      );

    /*
     * =======================================================
     * 10. SUMMARIES BY USER
     * =======================================================
     */

    const summariesByUser =
      userAnalytics.map(
        (user) => ({
          uid: user.uid,
          name: user.name,
          email: user.email,
          summaries: user.summaries,
        })
      );

    /*
     * =======================================================
     * 11. RESPONSE
     * =======================================================
     */

    return NextResponse.json({
      success: true,

      /*
       * Overall dashboard statistics
       */

      overview: {
        totalUsers,

        totalSearches,

        totalSummaries,

        totalSavedSummaries,

        totalTimeSavedMinutes,

        totalTimeSavedHours:
          Number(
            (
              totalTimeSavedMinutes / 60
            ).toFixed(1)
          ),

        totalQuizzesCompleted,
      },

      /*
       * Main users table
       */

      users: userAnalytics,

      /*
       * Keep this property because your existing
       * admin page appears to use userAnalytics.
       */

      userAnalytics,

      /*
       * Charts
       */

      registrations,

      userRegistrations:
        registrations,

      searchesByUser,

      summariesByUser,

      /*
       * Progress information required
       * by the admin dashboard.
       */

      progress: userAnalytics.map(
        (user) => ({
          uid: user.uid,

          totalSearches:
            user.searches,

          totalSummaries:
            user.summaries,

          savedSummaries:
            user.savedSummaries,

          timeSavedMinutes:
            user.timeSavedMinutes,

          quizzesCompleted:
            user.quizzesCompleted,

          streak:
            user.streak,

          lastActive:
            user.lastActive,
        })
      ),
    });
  } catch (error: unknown) {
    console.error(
      "ADMIN ANALYTICS ERROR:",
      error
    );

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
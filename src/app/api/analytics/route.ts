import { NextRequest, NextResponse } from "next/server";
import { DecodedIdToken } from "firebase-admin/auth";

import connectDB from "@/app/lib/mongodb";
import User from "@/models/User";
import Progress from "@/app/models/Progress";
import { adminAuth } from "@/lib/firebaseAdmin";

// ======================================================
// TYPES
// ======================================================

interface FirebaseToken extends DecodedIdToken {
  isAdmin?: boolean;
  admin?: boolean;
}

interface MongoUser {
  uid?: string;
  email?: string;

  firstName?: string;
  lastName?: string;
  photoURL?: string;

  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;

  totalSummaries?: number;
  learningStreak?: number;
  hoursSaved?: number;

  analytics?: {
    totalSearches?: number;
    summariesGenerated?: number;
    savedSummariesCount?: number;
    lastActive?: Date | string | null;
  };
}

interface MongoProgress {
  userId?: string;

  totalSearches?: number;
  totalSummaries?: number;
  savedSummaries?: number;

  timeSavedMinutes?: number;

  quizzesCompleted?: number;
  streak?: number;

  lastActive?: Date | string | null;
}

interface DashboardUser {
  uid: string;

  firstName: string;
  lastName: string;
  name: string;

  email: string;
  photoURL: string;

  joinedOn: Date | null;
  createdAt: Date | null;

  lastSignIn: Date | null;
  lastActive: Date | null;

  lastActiveFormatted: string;

  searches: number;
  summaries: number;
  savedSummaries: number;

  timeSavedMinutes: number;
  timeSavedHours: number;

  quizzesCompleted: number;
  streak: number;

  status: "Active" | "Inactive";
}

// ======================================================
// HELPERS
// ======================================================

function normalizeEmail(
  email?: string | null
): string {
  return email?.trim().toLowerCase() ?? "";
}

// ======================================================
// DATE
// ======================================================

function getDateValue(
  value?: Date | string | null
): Date | null {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

// ======================================================
// USER NAME
// ======================================================

function getUserName(
  firstName?: string,
  lastName?: string,
  email?: string
): string {
  const fullName =
    `${firstName ?? ""} ${lastName ?? ""}`
      .trim();

  if (fullName) {
    return fullName;
  }

  if (email) {
    return email.split("@")[0];
  }

  return "User";
}

// ======================================================
// ACTIVE USER
// ======================================================

function isActiveWithinDays(
  lastActive: Date | null,
  days: number
): boolean {
  if (!lastActive) {
    return false;
  }

  const difference =
    Date.now() -
    lastActive.getTime();

  const limit =
    days *
    24 *
    60 *
    60 *
    1000;

  return (
    difference >= 0 &&
    difference <= limit
  );
}

// ======================================================
// RELATIVE TIME
// ======================================================

function formatRelativeTime(
  date: Date | null
): string {
  if (!date) {
    return "Never";
  }

  const difference =
    Date.now() -
    date.getTime();

  if (difference < 0) {
    return "Just now";
  }

  const minutes =
    Math.floor(
      difference / 60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days =
    Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return date.toLocaleDateString(
    "en-IN"
  );
}

// ======================================================
// ADMIN CHECK
// ======================================================

function isAdminUser(
  email?: string | null,
  token?: FirebaseToken
): boolean {
  const normalizedEmail =
    normalizeEmail(email);

  const adminEmails = [
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_EMAIL_1,
    process.env.ADMIN_EMAIL_2,
  ]
    .map(normalizeEmail)
    .filter(Boolean);

  const emailIsAdmin =
    normalizedEmail !== "" &&
    adminEmails.includes(
      normalizedEmail
    );

  const claimIsAdmin =
    token?.isAdmin === true ||
    token?.admin === true;

  return (
    emailIsAdmin ||
    claimIsAdmin
  );
}

// ======================================================
// GET
// ======================================================

export async function GET(
  request: NextRequest
) {
  try {
    // ====================================================
    // 1. AUTHORIZATION
    // ====================================================

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
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

    const token =
      authorization
        .replace(
          "Bearer ",
          ""
        )
        .trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing authentication token",
        },
        {
          status: 401,
        }
      );
    }

    // ====================================================
    // 2. VERIFY FIREBASE TOKEN
    // ====================================================

    let decodedToken: FirebaseToken;

    try {
      decodedToken =
        (await adminAuth.verifyIdToken(
          token
        )) as FirebaseToken;
    } catch (error) {
      console.error(
        "Firebase token verification failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid authentication token",
        },
        {
          status: 401,
        }
      );
    }

    const adminEmail =
      normalizeEmail(
        decodedToken.email
      );

    // ====================================================
    // 3. ADMIN VERIFICATION
    // ====================================================

    const admin =
      isAdminUser(
        adminEmail,
        decodedToken
      );

    console.log(
      "================================="
    );

    console.log(
      "ANALYTICS ADMIN VERIFICATION"
    );

    console.log(
      "Email:",
      adminEmail
    );

    console.log(
      "Is Admin:",
      admin
    );

    console.log(
      "================================="
    );

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Admin access required",
        },
        {
          status: 403,
        }
      );
    }

    // ====================================================
    // 4. CONNECT DATABASE
    // ====================================================

    await connectDB();

    // ====================================================
    // 5. FIREBASE USERS
    // ====================================================

    const firebaseUsers: any[] = [];

    let nextPageToken:
      | string
      | undefined;

    do {
      const result =
        await adminAuth.listUsers(
          1000,
          nextPageToken
        );

      firebaseUsers.push(
        ...result.users
      );

      nextPageToken =
        result.pageToken;
    } while (nextPageToken);

    console.log(
      "Firebase users:",
      firebaseUsers.length
    );

    // ====================================================
    // 6. MONGODB USERS
    // ====================================================

    const mongoUsers =
      (await User.find({})
        .lean()) as unknown as MongoUser[];

    console.log(
      "MongoDB users:",
      mongoUsers.length
    );

    // ====================================================
    // 7. PROGRESS
    // ====================================================

    const progressRecords =
      (await Progress.find({})
        .lean()) as unknown as MongoProgress[];

    console.log(
      "Progress records:",
      progressRecords.length
    );

    // ====================================================
    // 8. MONGO LOOKUP BY UID
    // ====================================================

    const mongoUserMap =
      new Map<string, MongoUser>();

    // ====================================================
    // MONGO LOOKUP BY EMAIL
    // ====================================================

    const mongoEmailMap =
      new Map<string, MongoUser>();

    for (const mongoUser of mongoUsers) {
      if (mongoUser.uid) {
        mongoUserMap.set(
          mongoUser.uid,
          mongoUser
        );
      }

      if (mongoUser.email) {
        mongoEmailMap.set(
          normalizeEmail(
            mongoUser.email
          ),
          mongoUser
        );
      }
    }

    // ====================================================
    // 9. PROGRESS LOOKUP
    // ====================================================

    const progressMap =
      new Map<
        string,
        MongoProgress
      >();

    for (const progress of progressRecords) {
      if (progress.userId) {
        progressMap.set(
          progress.userId,
          progress
        );
      }
    }

    // ====================================================
    // 10. FINAL USER MAP
    //
    // IMPORTANT:
    // We combine BOTH Firebase + MongoDB.
    //
    // This fixes the problem where Firebase
    // users are unavailable but MongoDB has users.
    // ====================================================

    const userMap =
      new Map<
        string,
        {
          firebaseUser?: any;
          mongoUser?: MongoUser;
        }
      >();

    // ----------------------------------------------------
    // Add Firebase users
    // ----------------------------------------------------

    for (
      const firebaseUser
      of firebaseUsers
    ) {
      const uid =
        firebaseUser.uid;

      userMap.set(
        uid,
        {
          firebaseUser,
          mongoUser:
            mongoUserMap.get(
              uid
            ) ??
            mongoEmailMap.get(
              normalizeEmail(
                firebaseUser.email
              )
            ),
        }
      );
    }

    // ----------------------------------------------------
    // Add MongoDB users that don't exist
    // in Firebase list
    // ----------------------------------------------------

    for (
      const mongoUser
      of mongoUsers
    ) {
      const uid =
        mongoUser.uid;

      if (uid) {
        if (!userMap.has(uid)) {
          userMap.set(
            uid,
            {
              mongoUser,
            }
          );
        }

        continue;
      }

      // If UID isn't stored, use email
      const email =
        normalizeEmail(
          mongoUser.email
        );

      if (!email) {
        continue;
      }

      const firebaseMatch =
        firebaseUsers.find(
          (firebaseUser) =>
            normalizeEmail(
              firebaseUser.email
            ) === email
        );

      if (firebaseMatch) {
        continue;
      }

      // Use email as fallback identifier
      userMap.set(
        `mongo-${email}`,
        {
          mongoUser,
        }
      );
    }

    // ====================================================
    // 11. BUILD DASHBOARD USERS
    // ====================================================

    const users: DashboardUser[] =
      Array.from(
        userMap.entries()
      ).map(
        ([
          mapKey,
          record,
        ]) => {
          const firebaseUser =
            record.firebaseUser;

          const mongoUser =
            record.mongoUser;

          // ------------------------------------------------
          // UID
          // ------------------------------------------------

          const uid =
            firebaseUser?.uid ??
            mongoUser?.uid ??
            mapKey;

          // ------------------------------------------------
          // EMAIL
          // ------------------------------------------------

          const email =
            firebaseUser?.email ??
            mongoUser?.email ??
            "";

          // ------------------------------------------------
          // CREATED
          // ------------------------------------------------

          const firebaseCreatedAt =
            firebaseUser
              ?.metadata
              ?.creationTime
              ? new Date(
                  firebaseUser.metadata
                    .creationTime
                )
              : null;

          const mongoCreatedAt =
            getDateValue(
              mongoUser?.createdAt
            );

          const createdAt =
            firebaseCreatedAt ??
            mongoCreatedAt;

          // ------------------------------------------------
          // LAST SIGN IN
          // ------------------------------------------------

          const firebaseLastSignIn =
            firebaseUser
              ?.metadata
              ?.lastSignInTime
              ? new Date(
                  firebaseUser.metadata
                    .lastSignInTime
                )
              : null;

          // ------------------------------------------------
          // PROGRESS
          // ------------------------------------------------

          const progress =
            progressMap.get(
              uid
            );

          // ------------------------------------------------
          // LAST ACTIVE
          // ------------------------------------------------

          const mongoLastActive =
            getDateValue(
              progress?.lastActive ??
                mongoUser
                  ?.analytics
                  ?.lastActive ??
                mongoUser
                  ?.updatedAt ??
                null
            );

          const lastActive =
            firebaseLastSignIn ??
            mongoLastActive ??
            createdAt;

          // ------------------------------------------------
          // NAME
          // ------------------------------------------------

          const displayName =
            firebaseUser
              ?.displayName
              ?.trim() ?? "";

          const firebaseFirstName =
            displayName
              ? displayName.split(
                  " "
                )[0]
              : "";

          const firebaseLastName =
            displayName
              ? displayName
                .split(" ")
                .slice(1)
                .join(" ")
              : "";

          const firstName =
            mongoUser?.firstName ||
            firebaseFirstName ||
            "User";

          const lastName =
            mongoUser?.lastName ||
            firebaseLastName ||
            "";

          const name =
            getUserName(
              firstName,
              lastName,
              email
            );

          // ------------------------------------------------
          // PHOTO
          // ------------------------------------------------

          const photoURL =
            firebaseUser?.photoURL ||
            mongoUser?.photoURL ||
            "";

          // ------------------------------------------------
          // SEARCHES
          // ------------------------------------------------

          const searches =
            Number(
              progress?.totalSearches ??
                mongoUser
                  ?.analytics
                  ?.totalSearches ??
                0
            );

          // ------------------------------------------------
          // SUMMARIES
          // ------------------------------------------------

          const summaries =
            Number(
              progress?.totalSummaries ??
                mongoUser
                  ?.analytics
                  ?.summariesGenerated ??
                mongoUser
                  ?.totalSummaries ??
                0
            );

          // ------------------------------------------------
          // SAVED SUMMARIES
          // ------------------------------------------------

          const savedSummaries =
            Number(
              progress?.savedSummaries ??
                mongoUser
                  ?.analytics
                  ?.savedSummariesCount ??
                0
            );

          // ------------------------------------------------
          // TIME SAVED
          // ------------------------------------------------

          const timeSavedMinutes =
            Number(
              progress
                ?.timeSavedMinutes ??
                0
            );

          const timeSavedHours =
            Number(
              (
                timeSavedMinutes /
                60
              ).toFixed(1)
            );

          // ------------------------------------------------
          // QUIZZES
          // ------------------------------------------------

          const quizzesCompleted =
            Number(
              progress
                ?.quizzesCompleted ??
                0
            );

          // ------------------------------------------------
          // STREAK
          // ------------------------------------------------

          const streak =
            Number(
              progress?.streak ??
                mongoUser
                  ?.learningStreak ??
                0
            );

          // ------------------------------------------------
          // STATUS
          // ------------------------------------------------

          const active =
            isActiveWithinDays(
              lastActive,
              20
            );

          return {
            uid,

            firstName,
            lastName,
            name,

            email,
            photoURL,

            joinedOn:
              createdAt,

            createdAt,

            lastSignIn:
              firebaseLastSignIn,

            lastActive,

            lastActiveFormatted:
              formatRelativeTime(
                lastActive
              ),

            searches,
            summaries,
            savedSummaries,

            timeSavedMinutes,
            timeSavedHours,

            quizzesCompleted,
            streak,

            status:
              active
                ? "Active"
                : "Inactive",
          };
        }
      );

    // ====================================================
    // 12. REMOVE DUPLICATES
    // ====================================================

    const uniqueUsers =
      Array.from(
        new Map(
          users.map(
            (user) => [
              user.uid,
              user,
            ]
          )
        ).values()
      );

    // ====================================================
    // 13. SORT USERS
    // ====================================================

    uniqueUsers.sort(
      (a, b) => {
        const dateA =
          a.createdAt
            ? a.createdAt.getTime()
            : 0;

        const dateB =
          b.createdAt
            ? b.createdAt.getTime()
            : 0;

        return dateB - dateA;
      }
    );

    // ====================================================
    // 14. TOTAL USERS
    // ====================================================

    const totalUsers =
      uniqueUsers.length;

    // ====================================================
    // 15. TOTAL SEARCHES
    // ====================================================

    const totalSearches =
      uniqueUsers.reduce(
        (
          total,
          user
        ) =>
          total +
          Number(
            user.searches ?? 0
          ),
        0
      );

    // ====================================================
    // 16. TOTAL SUMMARIES
    // ====================================================

    const totalSummaries =
      uniqueUsers.reduce(
        (
          total,
          user
        ) =>
          total +
          Number(
            user.summaries ?? 0
          ),
        0
      );

    // ====================================================
    // 17. TOTAL SAVED
    // ====================================================

    const totalSavedSummaries =
      uniqueUsers.reduce(
        (
          total,
          user
        ) =>
          total +
          Number(
            user.savedSummaries ??
              0
          ),
        0
      );

    // ====================================================
    // 18. TOTAL TIME SAVED
    // ====================================================

    const totalTimeSavedMinutes =
      uniqueUsers.reduce(
        (
          total,
          user
        ) =>
          total +
          Number(
            user.timeSavedMinutes ??
              0
          ),
        0
      );

    const totalTimeSavedHours =
      Number(
        (
          totalTimeSavedMinutes /
          60
        ).toFixed(1)
      );

    // ====================================================
    // 19. TOTAL QUIZZES
    // ====================================================

    const totalQuizzesCompleted =
      uniqueUsers.reduce(
        (
          total,
          user
        ) =>
          total +
          Number(
            user.quizzesCompleted ??
              0
          ),
        0
      );

    // ====================================================
    // 20. ACTIVE USERS
    // ====================================================

    const activeUsers =
      uniqueUsers.filter(
        (user) =>
          user.status ===
          "Active"
      ).length;

    // ====================================================
    // 21. REGISTRATIONS
    // ====================================================

    const registrationMap =
      new Map<
        string,
        number
      >();

    for (
      const user
      of uniqueUsers
    ) {
      if (!user.createdAt) {
        continue;
      }

      const key =
        user.createdAt.toLocaleDateString(
          "en-IN"
        );

      registrationMap.set(
        key,
        (
          registrationMap.get(
            key
          ) ?? 0
        ) + 1
      );
    }

    const registrations =
      Array.from(
        registrationMap.entries()
      ).map(
        ([
          date,
          count,
        ]) => ({
          date,
          count,
        })
      );

    // ====================================================
    // 22. SEARCHES BY USER
    // ====================================================

    const searchesByUser =
      uniqueUsers.map(
        (user) => ({
          name: user.name,
          email: user.email,
          searches:
            user.searches,
        })
      );

    // ====================================================
    // 23. SUMMARIES BY USER
    // ====================================================

    const summariesByUser =
      uniqueUsers.map(
        (user) => ({
          name: user.name,
          email: user.email,
          summaries:
            user.summaries,
        })
      );

    // ====================================================
    // 24. DEBUG LOG
    // ====================================================

    console.log(
      "================================="
    );

    console.log(
      "ADMIN ANALYTICS RESULT"
    );

    console.log(
      "Firebase users:",
      firebaseUsers.length
    );

    console.log(
      "MongoDB users:",
      mongoUsers.length
    );

    console.log(
      "Progress records:",
      progressRecords.length
    );

    console.log(
      "Final dashboard users:",
      uniqueUsers.length
    );

    console.log(
      "Total searches:",
      totalSearches
    );

    console.log(
      "Total summaries:",
      totalSummaries
    );

    console.log(
      "Active users:",
      activeUsers
    );

    console.log(
      "================================="
    );

    // ====================================================
    // 25. RESPONSE
    // ====================================================

    return NextResponse.json(
      {
        success: true,

        stats: {
          totalUsers,
          totalSearches,
          totalSummaries,
          totalSavedSummaries,

          totalTimeSavedMinutes,
          totalTimeSavedHours,

          totalQuizzesCompleted,

          activeUsers,

          activeUsers7Days:
            activeUsers,
        },

        overview: {
          totalUsers,
          totalSearches,
          totalSummaries,
          totalSavedSummaries,

          totalTimeSavedMinutes,
          totalTimeSavedHours,

          totalQuizzesCompleted,

          activeUsers,

          activeUsers7Days:
            activeUsers,
        },

        users: uniqueUsers,

        userAnalytics:
          uniqueUsers,

        analytics: {
          registrations,
          searchesByUser,
          summariesByUser,
        },

        totals: {
          totalUsers,
          totalSearches,
          totalSummaries,
          totalSavedSummaries,

          totalTimeSavedMinutes,
          totalTimeSavedHours,

          totalQuizzesCompleted,

          activeUsers,
        },
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "ADMIN ANALYTICS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to load admin analytics",
      },
      {
        status: 500,
      }
    );
  }
}
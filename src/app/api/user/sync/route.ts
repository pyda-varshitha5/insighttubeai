import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import User from "../../../../models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      uid,
      firstName,
      lastName,
      email,
      photoURL,
    } = body;

    if (!uid || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "UID and email are required",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          firstName: firstName || "User",
          lastName: lastName || "",
          email: normalizedEmail,
          photoURL: photoURL || "",
          "analytics.lastActive": new Date(),
        },
        $setOnInsert: {
          totalSummaries: 0,
          hoursSaved: 0,
          learningStreak: 0,
          recentSearches: [],
          savedSummaries: [],
          analytics: {
            totalSearches: 0,
            videosViewed: 0,
            summariesGenerated: 0,
            savedSummariesCount: 0,
            lastActive: new Date(),
          },
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("USER SYNCED:", user.email);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("USER SYNC ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync user",
      },
      { status: 500 }
    );
  }
}
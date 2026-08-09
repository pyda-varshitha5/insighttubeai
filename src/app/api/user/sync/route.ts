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

    // Validate required fields
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
    const now = new Date();

    // First check if the user already exists
    const existingUser = await User.findOne({ uid });

    if (existingUser) {
      // Update existing user
      existingUser.firstName = firstName || existingUser.firstName || "User";
      existingUser.lastName = lastName || existingUser.lastName || "";
      existingUser.email = normalizedEmail;
      existingUser.photoURL = photoURL || existingUser.photoURL || "";

      // Update only analytics.lastActive
      if (!existingUser.analytics) {
        existingUser.analytics = {
          totalSearches: 0,
          videosViewed: 0,
          summariesGenerated: 0,
          savedSummariesCount: 0,
          lastActive: now,
        };
      } else {
        existingUser.analytics.lastActive = now;
      }

      await existingUser.save();

      console.log("EXISTING USER SYNCED:", existingUser.email);

      return NextResponse.json({
        success: true,
        user: existingUser,
      });
    }

    // Create a new user
    const newUser = await User.create({
      uid,
      firstName: firstName || "User",
      lastName: lastName || "",
      email: normalizedEmail,
      photoURL: photoURL || "",

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
        lastActive: now,
      },
    });

    console.log("NEW USER CREATED:", newUser.email);

    return NextResponse.json({
      success: true,
      user: newUser,
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
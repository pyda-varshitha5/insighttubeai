import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import User from "../../../../models/User";
import { adminAuth } from "../../../../lib/firebaseAdmin";

// ============================================
// GET SETTINGS
// ============================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    // Find user in MongoDB
    const user = await User.findOne({ uid }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load settings",
      },
      { status: 500 }
    );
  }
}

// ============================================
// UPDATE SETTINGS
// ============================================
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    const body = await req.json();

    const {
      firstName,
      lastName,
      phone,
      bio,
      photoURL,
      preferences,
      notifications,
    } = body;

    // ============================================
    // Update only allowed Settings fields
    // ============================================

    const updatedUser = await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          firstName,
          lastName,
          phone,
          bio,
          photoURL,

          preferences: {
            theme: preferences?.theme || "Light",
            language: preferences?.language || "English",
            timezone:
              preferences?.timezone ||
              "(GMT+05:30) Asia/Kolkata",
            summaryLength:
              preferences?.summaryLength || "Medium",
          },

          notifications: {
            emailNotifications:
              notifications?.emailNotifications ?? true,

            summaryCompleted:
              notifications?.summaryCompleted ?? true,

            weeklyDigest:
              notifications?.weeklyDigest ?? false,

            productUpdates:
              notifications?.productUpdates ?? true,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Settings saved successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to save settings",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/models/User";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    // ==========================================
    // CONNECT TO MONGODB
    // ==========================================

    await connectDB();

    // ==========================================
    // GET AUTHORIZATION HEADER
    // ==========================================

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // GET FIREBASE TOKEN
    // ==========================================

    const idToken = authorization.substring(7);

    // ==========================================
    // VERIFY FIREBASE TOKEN
    // ==========================================

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const uid = decodedToken.uid;
    const email = decodedToken.email || "";
    const displayName = decodedToken.name || "";
    const photoURL = decodedToken.picture || "";

    // ==========================================
    // SPLIT NAME
    // ==========================================

    const nameParts = displayName.trim().split(" ");

    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // ==========================================
    // FIND EXISTING USER
    // ==========================================

    let user = await User.findOne({ uid });

    // ==========================================
    // CREATE USER IF NOT EXISTS
    // ==========================================

    if (!user) {
      user = await User.create({
        uid,
        email: email.toLowerCase(),

        firstName,
        lastName,

        name: displayName,

        photoURL,

        recentSearches: [],

        hoursSaved: 0,
      });

      console.log("NEW USER CREATED:", email);
    } else {
      // ========================================
      // UPDATE EXISTING USER
      // ========================================

      user.email = email.toLowerCase();

      if (displayName) {
        user.name = displayName;
        user.firstName = firstName;
        user.lastName = lastName;
      }

      if (photoURL) {
        user.photoURL = photoURL;
      }

      await user.save();

      console.log("EXISTING USER SYNCED:", email);
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

      user: {
        uid: user.uid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        photoURL: user.photoURL,
      },
    });
  } catch (error: any) {
    console.error("USER SYNC ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to sync user",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

import connectDB from "../../lib/mongodb";
import SavedSummary from "../../../models/SavedSummary";
import Progress from "../../models/Progress";
import User from "../../../models/User";
import { adminAuth } from "@/lib/firebaseAdmin";

// ============================================
// SAVE SUMMARY
// ============================================

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ----------------------------------------
    // Verify Firebase authentication
    // ----------------------------------------

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    const decodedToken = await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    // ----------------------------------------
    // Read request body
    // ----------------------------------------

    const body = await req.json();

    const { title, markdown } = body;

    if (!title || !markdown) {
      return NextResponse.json(
        {
          error: "Title and markdown are required.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Check duplicate
    // ----------------------------------------

    const existing = await SavedSummary.findOne({
      userId: uid,
      title,
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySaved: true,
        message: "Already saved",
        summary: existing,
      });
    }

    // ----------------------------------------
    // Create saved summary
    // ----------------------------------------

    const savedSummary = await SavedSummary.create({
      userId: uid,
      title,
      markdown,
    });

    // ----------------------------------------
    // Update Progress
    // ----------------------------------------

    const progress = await Progress.findOne({
      userId: uid,
    });

    if (progress) {
      progress.savedSummaries =
        (progress.savedSummaries || 0) + 1;

      await progress.save();
    }

    // ----------------------------------------
    // Update User analytics
    // ----------------------------------------

    await User.findOneAndUpdate(
      { uid },
      {
        $inc: {
          "analytics.savedSummariesCount": 1,
        },
        $set: {
          "analytics.lastActive": new Date(),
        },
      }
    );

    console.log(
      "User saved summary analytics updated"
    );

    // ----------------------------------------
    // Return
    // ----------------------------------------

    return NextResponse.json(
      {
        success: true,
        alreadySaved: false,
        message: "Summary saved successfully",
        summary: savedSummary,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "SAVE SUMMARY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to save summary.",
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET SAVED SUMMARIES
// ============================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ----------------------------------------
    // Verify Firebase authentication
    // ----------------------------------------

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    const decodedToken =
      await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    // ----------------------------------------
    // Get summaries
    // ----------------------------------------

    const summaries =
      await SavedSummary.find({
        userId: uid,
      })
        .sort({ createdAt: -1 })
        .lean();

    return NextResponse.json(
      {
        success: true,
        summaries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET SAVED SUMMARIES ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch saved summaries.",
      },
      { status: 500 }
    );
  }
}
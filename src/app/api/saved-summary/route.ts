import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/mongodb";
import SavedSummary from "@/models/SavedSummary";
import Progress from "@/app/models/Progress";
import User from "@/models/User";


// ============================================
// SAVE SUMMARY
// ============================================

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      userId,
      title,
      markdown,
    } = body;

    // ------------------------------------------
    // Validate
    // ------------------------------------------

    if (!userId || !title || !markdown) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------
    // Check duplicate
    // ------------------------------------------

    const existing = await SavedSummary.findOne({
      userId,
      title,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: "Already saved",
          summary: existing,
        },
        {
          status: 200,
        }
      );
    }

    // ------------------------------------------
    // Create saved summary
    // ------------------------------------------

    const savedSummary = await SavedSummary.create({
      userId,
      title,
      markdown,
    });

    // ------------------------------------------
    // Update Progress
    // ------------------------------------------

    const progress = await Progress.findOne({
      userId,
    });

    if (progress) {
      progress.savedSummaries =
        (progress.savedSummaries || 0) + 1;

      await progress.save();
    }

    // ------------------------------------------
    // Update User analytics
    // ------------------------------------------

    await User.findOneAndUpdate(
      {
        uid: userId,
      },
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

    // ------------------------------------------
    // Success
    // ------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Summary saved successfully",
        summary: savedSummary,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "SAVE SUMMARY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save summary.",
      },
      {
        status: 500,
      }
    );
  }
}


// ============================================
// GET SAVED SUMMARIES
// ============================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(req.url);

    const userId =
      searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID required",
        },
        {
          status: 400,
        }
      );
    }

    const summaries =
      await SavedSummary.find({
        userId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json(
      {
        success: true,
        summaries,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "GET SAVED SUMMARIES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to fetch saved summaries",
      },
      {
        status: 500,
      }
    );
  }
}
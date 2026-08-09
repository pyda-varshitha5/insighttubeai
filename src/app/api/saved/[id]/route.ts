import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import SavedSummary from "../../../models/SavedSummary";
import Progress from "../../../models/Progress";
import User from "../../../../models/User";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const summary = await SavedSummary.findById(id);

    if (!summary) {
      return NextResponse.json(
        { error: "Summary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const summary = await SavedSummary.findById(id);

    if (!summary) {
      return NextResponse.json(
        { error: "Summary not found" },
        { status: 404 }
      );
    }

    const userId = summary.userId;

    // Delete saved summary
    await SavedSummary.findByIdAndDelete(id);

    // Update Progress
    const progress = await Progress.findOne({ userId });

    if (progress && progress.savedSummaries > 0) {
      progress.savedSummaries -= 1;
      await progress.save();
    }

    // Update User analytics
    await User.findOneAndUpdate(
      { uid: userId },
      {
        $inc: {
          "analytics.savedSummariesCount": -1,
        },
        $set: {
          "analytics.lastActive": new Date(),
        },
      }
    );

    console.log("Saved summary analytics decreased");

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE SAVED SUMMARY ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete summary" },
      { status: 500 }
    );
  }
}
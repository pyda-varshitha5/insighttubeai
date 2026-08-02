import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import SavedSummary from "../../../models/SavedSummary";
import Progress from "../../../models/Progress";

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

    await SavedSummary.findByIdAndDelete(id);

    const progress = await Progress.findOne({ userId });

    if (progress && progress.savedSummaries > 0) {
      progress.savedSummaries -= 1;
      await progress.save();
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete summary" },
      { status: 500 }
    );
  }
}
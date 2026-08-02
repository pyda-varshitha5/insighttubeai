import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import SavedSummary from "../../../models/SavedSummary";
import Progress from "../../models/Progress";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, title, markdown } = await req.json();

    if (!userId || !title || !markdown) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Prevent duplicate saves
    const existing = await SavedSummary.findOne({
      userId,
      title,
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Already saved",
      });
    }

    await SavedSummary.create({
      userId,
      title,
      markdown,
    });

    // Update dashboard count
    const progress = await Progress.findOne({ userId });

    if (progress) {
      progress.savedSummaries += 1;
      await progress.save();
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save summary." },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const summaries = await SavedSummary.find({ userId })
      .sort({ createdAt: -1 });

    return NextResponse.json(summaries);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch saved summaries" },
      { status: 500 }
    );
  }
}
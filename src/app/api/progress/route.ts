import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import Progress from "../../models/Progress";
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const progress = await Progress.findOne({ userId });

    return NextResponse.json(
      progress || {
        totalSearches: 0,
        totalSummaries: 0,
        savedSummaries: 0,
        quizzesCompleted: 0,
        streak: 0,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
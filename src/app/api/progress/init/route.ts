import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Progress from "../../../models/Progress";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId } = await req.json();

    console.log("User ID:", userId);

    const existing = await Progress.findOne({ userId });

    console.log("Existing:", existing);

    if (!existing) {
      const progress = await Progress.create({
        userId,
      });

      console.log("Created:", progress);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("ERROR:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
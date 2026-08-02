import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();

    const user = await User.findOneAndUpdate(
      { email },
      {
        recentSearches: [],
      },
      {
        new: true,
      }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
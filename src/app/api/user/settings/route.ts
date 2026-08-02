import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      uid,
      firstName,
      lastName,
      email,
      photoURL,
    } = body;

    if (!uid || !email || !firstName) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        existingUser,
        {
          status: 200,
        }
      );
    }

    // Create new user
    const user = await User.create({
      uid,
      firstName,
      lastName,
      email,
      photoURL,

      phone: "",
      bio: "",

      preferences: {
        theme: "light",
        language: "English",
        timezone: "(GMT+05:30) Asia/Kolkata",
        summaryLength: "Medium",
      },

      notifications: {
        emailNotifications: true,
        summaryCompleted: true,
        weeklyDigest: false,
        productUpdates: true,
      },

      recentSearches: [],
      savedSummaries: [],
      totalSummaries: 0,
      hoursSaved: 0,
      learningStreak: 0,
    });

    return NextResponse.json(
      user,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Progress from "../../../models/Progress";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      userId,
      firstName,
      lastName,
      email,
      photoURL,
    } = await req.json();

    console.log("User ID:", userId);
    console.log("Email:", email);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }

    // =========================
    // Create / update User
    // =========================

    if (email) {
      const existingUser = await User.findOne({
        uid: userId,
      });

      if (!existingUser) {
        await User.create({
          uid: userId,
          firstName: firstName || "User",
          lastName: lastName || "",
          email: email.toLowerCase(),
          photoURL: photoURL || "",
        });

        console.log("MongoDB User created");
      } else {
        await User.findOneAndUpdate(
          { uid: userId },
          {
            $set: {
              firstName:
                firstName || existingUser.firstName,
              lastName:
                lastName ?? existingUser.lastName,
              email: email.toLowerCase(),
              photoURL:
                photoURL ?? existingUser.photoURL,
            },
          }
        );

        console.log("MongoDB User updated");
      }
    }

    // =========================
    // Create Progress
    // =========================

    const existingProgress = await Progress.findOne({
      userId,
    });

    console.log(
      "Existing Progress:",
      existingProgress
    );

    if (!existingProgress) {
      const progress = await Progress.create({
        userId,
      });

      console.log("Progress created:", progress);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
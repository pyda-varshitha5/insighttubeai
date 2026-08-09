import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import User from "../../../../models/User";
import { adminAuth } from "../../../../lib/firebaseAdmin";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    // Get Firebase token
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase user
    const decodedToken = await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    // Find MongoDB user
    const user = await User.findOne({ uid });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete MongoDB user
    await User.deleteOne({ uid });

    // Delete Firebase account
    await adminAuth.deleteUser(uid);

    return NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE ACCOUNT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete account",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

import connectDB from "../../../lib/mongodb";
import User from "@/models/User";
import SavedSummary from "@/models/SavedSummary";

import { adminAuth } from "@/lib/firebaseAdmin";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    // ============================================
    // GET FIREBASE TOKEN
    // ============================================

    const authHeader =
      req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      authHeader.split("Bearer ")[1];

    // ============================================
    // VERIFY FIREBASE USER
    // ============================================

    const decodedToken =
      await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    // ============================================
    // FIND USER
    // ============================================

    const user = await User.findOne({
      uid,
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // ============================================
    // CLEAR SEARCH HISTORY
    // ============================================

    user.recentSearches = [];

    await user.save();

    // ============================================
    // DELETE SAVED SUMMARIES FROM HISTORY
    // ============================================

    const deletedSummaries =
      await SavedSummary.deleteMany({
        userId: uid,
      });

    console.log(
      "Deleted saved summaries:",
      deletedSummaries.deletedCount
    );

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json(
      {
        success: true,

        message:
          "History cleared successfully",

        deletedSummaries:
          deletedSummaries.deletedCount,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "CLEAR HISTORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to clear history",
      },
      {
        status: 500,
      }
    );
  }
}
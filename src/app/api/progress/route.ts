import {
  NextRequest,
  NextResponse,
} from "next/server";

import connectDB from "@/app/lib/mongodb";
import Progress from "@/app/models/Progress";

/*
|--------------------------------------------------------------------------
| GET PROGRESS
|--------------------------------------------------------------------------
|
| /api/progress?userId=USER_ID
|
*/
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        {
          status: 400,
        }
      );
    }

    let progress = await Progress.findOne({
      userId,
    });

    /*
     * Create progress document for a new user.
     */
    if (!progress) {
      progress = await Progress.create({
        userId,
        totalSearches: 0,
        totalSummaries: 0,
        savedSummaries: 0,
        quizzesCompleted: 0,
      });
    }

    return NextResponse.json({
      success: true,
      totalSearches: Number(
        progress.totalSearches ?? 0
      ),
      totalSummaries: Number(
        progress.totalSummaries ?? 0
      ),
      savedSummaries: Number(
        progress.savedSummaries ?? 0
      ),
      quizzesCompleted: Number(
        progress.quizzesCompleted ?? 0
      ),
    });
  } catch (error) {
    console.error(
      "GET /api/progress error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch progress",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST PROGRESS
|--------------------------------------------------------------------------
*/
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const userId = body?.userId;
    const action = body?.action;

    if (
      typeof userId !== "string" ||
      userId.trim() === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid user ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof action !== "string" ||
      action.trim() === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid action is required",
        },
        {
          status: 400,
        }
      );
    }

    let progress = await Progress.findOne({
      userId,
    });

    /*
     * Create progress if it doesn't exist.
     */
    if (!progress) {
      progress = await Progress.create({
        userId,
        totalSearches: 0,
        totalSummaries: 0,
        savedSummaries: 0,
        quizzesCompleted: 0,
      });
    }

    /*
     * QUIZ COMPLETED
     */
    if (action === "quiz_completed") {
      progress.quizzesCompleted =
        Number(progress.quizzesCompleted ?? 0) + 1;
    }

    /*
     * SEARCH
     */
    else if (action === "search") {
      progress.totalSearches =
        Number(progress.totalSearches ?? 0) + 1;
    }

    /*
     * SUMMARY
     */
    else if (action === "summary") {
      progress.totalSummaries =
        Number(progress.totalSummaries ?? 0) + 1;
    }

    /*
     * SAVE
     */
    else if (action === "save") {
      progress.savedSummaries =
        Number(progress.savedSummaries ?? 0) + 1;
    }

    /*
     * INVALID ACTION
     */
    else {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid action: ${action}`,
        },
        {
          status: 400,
        }
      );
    }

    await progress.save();

    return NextResponse.json({
      success: true,
      totalSearches: Number(
        progress.totalSearches ?? 0
      ),
      totalSummaries: Number(
        progress.totalSummaries ?? 0
      ),
      savedSummaries: Number(
        progress.savedSummaries ?? 0
      ),
      quizzesCompleted: Number(
        progress.quizzesCompleted ?? 0
      ),
    });
  } catch (error) {
    console.error(
      "POST /api/progress error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update progress",
      },
      {
        status: 500,
      }
    );
  }
}
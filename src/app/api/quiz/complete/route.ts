import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Progress from "@/app/models/Progress";

export async function POST(req: NextRequest) {
  try {
    // ============================================
    // CONNECT DATABASE
    // ============================================

    await connectDB();

    // ============================================
    // READ REQUEST BODY
    // ============================================

    const body = await req.json();

    const userId =
      typeof body?.userId === "string"
        ? body.userId.trim()
        : "";

    const topic =
      typeof body?.topic === "string"
        ? body.topic.trim()
        : "";

    const score =
      typeof body?.score === "number"
        ? body.score
        : 0;

    const totalQuestions =
      typeof body?.totalQuestions === "number"
        ? body.totalQuestions
        : 0;

    // ============================================
    // VALIDATION
    // ============================================

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message: "Quiz topic is required.",
        },
        {
          status: 400,
        }
      );
    }

    console.log("====================================");
    console.log("QUIZ COMPLETION");
    console.log("User ID:", userId);
    console.log("Topic:", topic);
    console.log("Score:", score);
    console.log("Total Questions:", totalQuestions);
    console.log("====================================");

    // ============================================
    // FIND USER PROGRESS
    // ============================================

    let progress = await Progress.findOne({
      userId,
    });

    // ============================================
    // CREATE PROGRESS IF NOT EXISTS
    // ============================================

    if (!progress) {
      progress = new Progress({
        userId,
        searchedTopics: [],
        totalSearches: 0,
        totalSummaries: 0,
        savedSummaries: 0,
        timeSavedMinutes: 0,
        quizzesCompleted: 0,
        streak: 0,
      });
    }

    // ============================================
    // CURRENT QUIZ COUNT
    // ============================================

    const currentQuizCount =
      typeof progress.quizzesCompleted === "number"
        ? progress.quizzesCompleted
        : 0;

    // ============================================
    // INCREMENT QUIZ COUNT
    // ============================================

    progress.quizzesCompleted =
      currentQuizCount + 1;

    // ============================================
    // MAKE SURE SEARCHED TOPICS EXISTS
    // ============================================

    if (!Array.isArray(progress.searchedTopics)) {
      progress.searchedTopics = [];
    }

    // ============================================
    // SAVE TOPIC IF NOT ALREADY PRESENT
    // ============================================

    const normalizedTopic =
      topic.trim().toLowerCase();

    const alreadyExists =
      progress.searchedTopics.some(
        (item: string) =>
          item.trim().toLowerCase() ===
          normalizedTopic
      );

    if (!alreadyExists) {
      progress.searchedTopics.push(
        normalizedTopic
      );
    }

    // ============================================
    // TOTAL SEARCHES = UNIQUE TOPICS
    // ============================================

    progress.totalSearches =
      progress.searchedTopics.length;

    // ============================================
    // SAVE PROGRESS
    // ============================================

    await progress.save();

    console.log(
      "Quiz completion saved successfully."
    );

    console.log(
      "New quizzesCompleted:",
      progress.quizzesCompleted
    );

    console.log(
      "Total searched topics:",
      progress.totalSearches
    );

    // ============================================
    // RETURN RESULT
    // ============================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Quiz completion saved successfully.",

        quizzesCompleted:
          progress.quizzesCompleted,

        totalSearches:
          progress.totalSearches,

        topic,

        score,

        totalQuestions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "QUIZ COMPLETION API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to save quiz completion.",
      },
      {
        status: 500,
      }
    );
  }
}
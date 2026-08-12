import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import Progress from "../../models/Progress";

// ======================================================
// GET USER PROGRESS
// ======================================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 }
      );
    }

    const progress = await Progress.findOne({ userId }).lean();

    // --------------------------------------------------
    // NO PROGRESS YET
    // --------------------------------------------------

    if (!progress) {
      return NextResponse.json({
        success: true,
        totalSearches: 0,
        totalSummaries: 0,
        savedSummaries: 0,
        timeSavedMinutes: 0,
        quizzesCompleted: 0,
        streak: 0,
        searchedTopics: [],
        generatedSummaries: [],
      });
    }

    // --------------------------------------------------
    // UNIQUE SEARCH TOPICS
    // --------------------------------------------------

    const searchedTopics = Array.isArray(progress.searchedTopics)
      ? progress.searchedTopics
      : [];

    const uniqueTopics = [
      ...new Set(
        searchedTopics
          .filter(
            (topic: unknown): topic is string =>
              typeof topic === "string" && topic.trim().length > 0
          )
          .map((topic: string) => topic.trim().toLowerCase())
      ),
    ];

    const totalSearches = uniqueTopics.length;

    // --------------------------------------------------
    // GENERATED SUMMARIES
    // --------------------------------------------------

    const generatedSummaries = Array.isArray(progress.generatedSummaries)
      ? progress.generatedSummaries
      : [];

    /*
     * totalSummaries represents the number of summaries
     * actually stored in generatedSummaries.
     *
     * This prevents the dashboard from showing an old
     * totalSummaries value.
     */
    const totalSummaries = generatedSummaries.length;

    // --------------------------------------------------
    // KEEP DATABASE SYNCHRONIZED
    // --------------------------------------------------

    await Progress.updateOne(
      { userId },
      {
        $set: {
          searchedTopics: uniqueTopics,
          totalSearches,
          totalSummaries,
        },
      }
    );

    // --------------------------------------------------
    // RETURN PROGRESS
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      totalSearches,

      totalSummaries,

      savedSummaries:
        typeof progress.savedSummaries === "number"
          ? progress.savedSummaries
          : 0,

      timeSavedMinutes:
        typeof progress.timeSavedMinutes === "number"
          ? progress.timeSavedMinutes
          : 0,

      quizzesCompleted:
        typeof progress.quizzesCompleted === "number"
          ? progress.quizzesCompleted
          : 0,

      streak:
        typeof progress.streak === "number"
          ? progress.streak
          : 0,

      searchedTopics: uniqueTopics,

      generatedSummaries,
    });
  } catch (error) {
    console.error("PROGRESS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch progress.",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// POST - UPDATE PROGRESS
//
// Supported actions:
//
// 1. completeQuiz
// 2. addSearch
// 3. addSummary
// ======================================================

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const userId =
      typeof body?.userId === "string"
        ? body.userId.trim()
        : "";

    const action =
      typeof body?.action === "string"
        ? body.action.trim()
        : "";

    // --------------------------------------------------
    // VALIDATE USER
    // --------------------------------------------------

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // FIND OR CREATE PROGRESS
    // ==================================================

    let progress = await Progress.findOne({ userId });

    if (!progress) {
      progress = new Progress({
        userId,
        searchedTopics: [],
        generatedSummaries: [],
        totalSearches: 0,
        totalSummaries: 0,
        savedSummaries: 0,
        timeSavedMinutes: 0,
        quizzesCompleted: 0,
        streak: 0,
      });
    }

    // ==================================================
    // COMPLETE QUIZ
    // ==================================================

    if (action === "completeQuiz") {
      progress.quizzesCompleted =
        Number(progress.quizzesCompleted || 0) + 1;

      await progress.save();

      console.log(
        "QUIZ COMPLETED:",
        userId,
        "Total:",
        progress.quizzesCompleted
      );

      return NextResponse.json({
        success: true,
        action: "completeQuiz",
        quizzesCompleted: progress.quizzesCompleted,
      });
    }

    // ==================================================
    // ADD SEARCH TOPIC
    // ==================================================

    if (action === "addSearch") {
      const topic =
        typeof body?.topic === "string"
          ? body.topic.trim().toLowerCase()
          : "";

      if (!topic) {
        return NextResponse.json(
          {
            success: false,
            message: "Topic is required.",
          },
          { status: 400 }
        );
      }

      if (!Array.isArray(progress.searchedTopics)) {
        progress.searchedTopics = [];
      }

      if (!progress.searchedTopics.includes(topic)) {
        progress.searchedTopics.push(topic);
      }

      progress.totalSearches =
        progress.searchedTopics.length;

      await progress.save();

      return NextResponse.json({
        success: true,
        action: "addSearch",
        totalSearches: progress.totalSearches,
        searchedTopics: progress.searchedTopics,
      });
    }

    // ==================================================
    // ADD GENERATED SUMMARY
    // ==================================================

    if (action === "addSummary") {
      const topic =
        typeof body?.topic === "string"
          ? body.topic.trim().toLowerCase()
          : "";

      if (!Array.isArray(progress.generatedSummaries)) {
        progress.generatedSummaries = [];
      }

      /*
       * Every generated summary increases the count.
       *
       * We intentionally DO NOT check whether the topic
       * already exists because the same topic can be
       * summarized more than once.
       */

      if (topic) {
        progress.generatedSummaries.push(topic);
      } else {
        progress.generatedSummaries.push("summary");
      }

      progress.totalSummaries =
        progress.generatedSummaries.length;

      await progress.save();

      console.log(
        "SUMMARY GENERATED:",
        userId,
        "Topic:",
        topic,
        "Total:",
        progress.totalSummaries
      );

      return NextResponse.json({
        success: true,
        action: "addSummary",
        totalSummaries: progress.totalSummaries,
        generatedSummaries:
          progress.generatedSummaries,
      });
    }

    // ==================================================
    // INVALID ACTION
    // ==================================================

    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid action. Use completeQuiz, addSearch, or addSummary.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("PROGRESS POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update progress.",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/mongodb";
import User from "@/models/User";
import SavedSummary from "@/models/SavedSummary";

import { adminAuth } from "@/lib/firebaseAdmin";

// ============================================
// GET HISTORY
// ============================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ==========================================
    // VERIFY AUTHORIZATION
    // ==========================================

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    // ==========================================
    // FIND USER
    // ==========================================

    const user = await User.findOne({ uid }).lean();

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // GET SAVED SUMMARIES
    // ==========================================

    const summaries = await SavedSummary.find({
      userId: uid,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    // ==========================================
    // CONVERT SUMMARIES
    // ==========================================

    const summaryRows = summaries.map((summary: any) => {
      const createdAt = summary.createdAt
        ? new Date(summary.createdAt)
        : null;

      return {
        id: String(summary._id),

        title: summary.title || "Untitled Summary",

        description: "Generated summary",

        type: "Summary" as const,

        date: createdAt
          ? createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",

        time: createdAt
          ? createdAt.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",

        iconBg: "from-violet-100 to-violet-50",

        iconText: "text-violet-600",
      };
    });

    // ==========================================
    // GET SEARCH HISTORY
    // ==========================================

    const searchRows = (user.recentSearches || []).map(
      (search: any, index: number) => {
        const createdAt = search.createdAt
          ? new Date(search.createdAt)
          : null;

        return {
          /*
           * Keep the index so we can identify the
           * exact search item when deleting it.
           */
          id: `search-${index}`,

          title: search.query || "Untitled Search",

          description: "Search query",

          type: "Search" as const,

          date: createdAt
            ? createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Date unavailable",

          time: createdAt
            ? createdAt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",

          iconBg: "from-blue-100 to-blue-50",

          iconText: "text-blue-600",
        };
      }
    );

    // ==========================================
    // COMBINE HISTORY
    // ==========================================

    const history = [...summaryRows, ...searchRows];

    // ==========================================
    // RETURN RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        history,
        total: history.length,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("GET HISTORY ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load history",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================
// DELETE HISTORY ITEM
// ============================================

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    // ==========================================
    // VERIFY AUTHORIZATION
    // ==========================================

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    // ==========================================
    // GET ID
    // ==========================================

    let id: string | null = null;

    // Support:
    // DELETE /api/history?id=xxxxx
    const url = new URL(req.url);
    id = url.searchParams.get("id");

    // Also support:
    // body: { id: "xxxxx" }
    if (!id) {
      try {
        const body = await req.json();

        if (body?.id) {
          id = body.id;
        }
      } catch {
        // No JSON body - continue with query parameter
      }
    }

    if (!id) {
      return NextResponse.json(
        {
          error: "History item ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // DELETE SEARCH HISTORY
    // ==========================================

    if (id.startsWith("search-")) {
      const indexString = id.replace("search-", "");
      const index = Number(indexString);

      if (!Number.isInteger(index) || index < 0) {
        return NextResponse.json(
          {
            error: "Invalid search history ID",
          },
          {
            status: 400,
          }
        );
      }

      const user = await User.findOne({ uid });

      if (!user) {
        return NextResponse.json(
          {
            error: "User not found",
          },
          {
            status: 404,
          }
        );
      }

      const recentSearches = user.recentSearches || [];

      if (index >= recentSearches.length) {
        return NextResponse.json(
          {
            error: "Search history item not found",
          },
          {
            status: 404,
          }
        );
      }

      // Remove ONLY the selected search
      recentSearches.splice(index, 1);

      user.recentSearches = recentSearches;

      await user.save();

      return NextResponse.json(
        {
          success: true,
          message: "Search history deleted successfully",
        },
        {
          status: 200,
        }
      );
    }

    // ==========================================
    // DELETE GENERATED SUMMARY
    // ==========================================

    const deletedSummary = await SavedSummary.findOneAndDelete({
      _id: id,
      userId: uid,
    });

    if (!deletedSummary) {
      return NextResponse.json(
        {
          error: "History item not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Summary history deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("DELETE HISTORY ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete history item",
      },
      {
        status: 500,
      }
    );
  }
}
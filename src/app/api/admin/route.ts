import {
  NextRequest,
  NextResponse,
} from "next/server";

import { adminAuth } from "@/lib/firebaseAdmin";

// ======================================================
// POST - VERIFY ADMIN
// ======================================================

export async function POST(
  request: NextRequest
) {
  try {
    // --------------------------------------------------
    // GET AUTHORIZATION HEADER
    // --------------------------------------------------

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          authorized: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // GET FIREBASE TOKEN
    // --------------------------------------------------

    const idToken =
      authorization.substring(7).trim();

    if (!idToken) {
      return NextResponse.json(
        {
          authorized: false,
          error: "Missing authentication token",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // VERIFY FIREBASE TOKEN
    // --------------------------------------------------

    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    const email =
      decodedToken.email?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          authorized: false,
          error:
            "Authenticated user has no email",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------
    // ADMIN EMAILS
    // --------------------------------------------------

    const adminEmail1 =
      process.env.ADMIN_EMAIL_1
        ?.trim()
        .toLowerCase();

    const adminEmail2 =
      process.env.ADMIN_EMAIL_2
        ?.trim()
        .toLowerCase();

    // --------------------------------------------------
    // CHECK ADMIN
    // --------------------------------------------------

    const isAdmin =
      email === adminEmail1 ||
      email === adminEmail2;

    console.log(
      "Admin verification:",
      {
        email,
        isAdmin,
      }
    );

    if (!isAdmin) {
      return NextResponse.json(
        {
          authorized: false,
          error:
            "Admin access denied",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------
    // ADMIN SUCCESS
    // --------------------------------------------------

    return NextResponse.json({
      authorized: true,
      email,
    });
  } catch (error) {
    console.error(
      "Admin verification error:",
      error
    );

    return NextResponse.json(
      {
        authorized: false,
        error:
          "Invalid authentication",
      },
      {
        status: 401,
      }
    );
  }
}

// ======================================================
// GET
// ======================================================

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Use POST for admin authentication",
    },
    {
      status: 405,
    }
  );
}
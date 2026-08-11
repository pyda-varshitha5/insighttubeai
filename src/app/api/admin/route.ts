import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

function getAdminEmails(): string[] {
  return [
    process.env.ADMIN_EMAIL_1,
    process.env.ADMIN_EMAIL_2,
  ]
    .filter(Boolean)
    .map((email) => email!.trim().toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    // Get Firebase ID token
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          authorized: false,
          isAdmin: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const idToken = authorization
      .replace("Bearer ", "")
      .trim();

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          authorized: false,
          isAdmin: false,
          error: "Missing authentication token",
        },
        { status: 401 }
      );
    }

    // Verify Firebase user
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const email = decodedToken.email
      ?.trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          authorized: false,
          isAdmin: false,
          error: "Firebase account has no email",
        },
        { status: 403 }
      );
    }

    // Check authorized admin emails
    const adminEmails = getAdminEmails();

    const isAdmin = adminEmails.includes(email);

    console.log("================================");
    console.log("ADMIN VERIFICATION");
    console.log("Firebase email:", email);
    console.log("Allowed admins:", adminEmails);
    console.log("Is admin:", isAdmin);
    console.log("================================");

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          authorized: false,
          isAdmin: false,
          email,
          error: "Admin access denied",
        },
        { status: 403 }
      );
    }

    // Admin successfully verified
    return NextResponse.json(
      {
        success: true,
        authorized: true,
        isAdmin: true,
        email,
        uid: decodedToken.uid,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin verification error:", error);

    return NextResponse.json(
      {
        success: false,
        authorized: false,
        isAdmin: false,
        error:
          error instanceof Error
            ? error.message
            : "Admin authentication failed",
      },
      { status: 401 }
    );
  }
}

// Prevent accidental GET requests from returning HTML
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      authorized: false,
      isAdmin: false,
      error: "Use POST /api/admin for admin authentication",
    },
    { status: 405 }
  );
}
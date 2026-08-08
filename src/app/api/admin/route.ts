import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { authorized: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const idToken = authorization.substring(7);

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const email = decodedToken.email?.toLowerCase();

    const adminEmail1 =
      process.env.ADMIN_EMAIL_1?.toLowerCase();

    const adminEmail2 =
      process.env.ADMIN_EMAIL_2?.toLowerCase();

    const isAdmin =
      !!email &&
      (email === adminEmail1 || email === adminEmail2);

    if (!isAdmin) {
      return NextResponse.json(
        {
          authorized: false,
          error: "Admin access denied",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authorized: true,
      email,
    });
  } catch (error) {
    console.error("Admin verification error:", error);

    return NextResponse.json(
      {
        authorized: false,
        error: "Invalid authentication",
      },
      { status: 401 }
    );
  }
}
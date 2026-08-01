import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(
        query
      )}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data[1]);
  } catch (error) {
    console.error(error);

    return NextResponse.json([]);
  }
}
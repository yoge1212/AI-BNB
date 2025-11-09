import { NextResponse } from "next/server";

const BACKEND_PUBLISH_LISTING_URL = "http://backend:5001/publish-listing";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const res = await fetch(BACKEND_PUBLISH_LISTING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing: data }),
    });

    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "Publish failed");
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
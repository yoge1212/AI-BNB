import { NextResponse } from "next/server";

const BACKEND_GET_LISTINGS_URL = "http://backend:5001/get-listing";

export async function GET(req: Request) {
  try {
    const res = await fetch(BACKEND_GET_LISTINGS_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "Fetch listings failed");
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}


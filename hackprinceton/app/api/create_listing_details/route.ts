import { NextResponse } from "next/server";


const BACKEND_CREATE_LISTING_URL = "http://backend:5001/create-listing";

export const dynamic = "force-dynamic"; // ensures it's run fresh per request

export async function POST(req: Request) {
  try {
    // Parse input JSON body
    const { images } = (await req.json()) as { images?: string[] };
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'images' array" },
        { status: 400 }
      );
    }

    // Forward the request to Flask backend
    const backendRes = await fetch(BACKEND_CREATE_LISTING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images }),
    });

    // Handle non-OK responses from backend
    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json(
        { error: text || "Backend error" },
        { status: backendRes.status }
      );
    }

    // Parse backend response (expected JSON from Flask)
    const data = await backendRes.json();

    // If Flask backend returned an explicit error
    if (data?.ok === false) {
      return NextResponse.json(
        { error: data.error || "Listing generation failed" },
        { status: 502 }
      );
    }

    // Return the AI-generated listing to frontend
    return NextResponse.json({ listing: data });
  } catch (err) {
    console.error("Error in create-listing API route:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

const BACKEND_CHAT_URL = "http://backend:5001/query-agent";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // --- FIX 1: Read BOTH 'message' and 'history' ---
    const body = (await req.json()) as {
      message?: string;
      history?: Array<{ role: string; content: string }>;
      user_id?: string;
    };

    const { message, history, user_id } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing 'message'" }, { status: 400 });
    }

    // --- FIX 2: Validate the 'history' field ---
    if (history === undefined || !Array.isArray(history)) {
      return NextResponse.json(
        { error: "Missing 'history' array" },
        { status: 400 },
      );
    }

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json(
        { error: "Missing 'user_id'" },
        { status: 400 },
      );
    }

    const backendRes = await fetch(BACKEND_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // --- FIX 3: Send BOTH 'message' and 'history' to Flask ---
      body: JSON.stringify({ message, history, user_id }),
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      // This is where you would have seen the "missing chat_history" error
      return NextResponse.json(
        { error: text || "Backend error" },
        { status: 502 },
      );
    }

    const data = (await backendRes.json()) as {
      ok?: boolean;
      output?: string;
      error?: string;
      reply?: string;
      trip?: boolean;
      trip_response?: unknown;
      [k: string]: unknown;
    };

    if (data && "trip" in data && data.trip) {
      return NextResponse.json(data);
    }

    if (data && data.ok === false) {
      return NextResponse.json(
        { error: data.error || "Backend error" },
        { status: 502 },
      );
    }

    const reply =
      typeof data.reply === "string"
        ? data.reply
        : typeof data.output === "string"
          ? data.output
          : JSON.stringify(data);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Unexpected server error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}
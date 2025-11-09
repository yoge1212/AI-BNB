import { NextResponse } from "next/server";

const BACKEND_CHAT_URL = "http://backend:5001/query-agent";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // --- FIX 1: Read BOTH 'message' and 'history' ---
    const body = (await req.json()) as {
      message?: string;
      history?: any[]; // <-- Read the history
    };

    const { message, history } = body;

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

    const backendRes = await fetch(BACKEND_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // --- FIX 3: Send BOTH 'message' and 'history' to Flask ---
      body: JSON.stringify({ message, history }),
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
      [k: string]: unknown;
    };

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
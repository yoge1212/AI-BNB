import { NextResponse } from "next/server";

const BACKEND_CHAT_URL = "http://backend:5001/query-agent";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message?: string };
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing 'message'" }, { status: 400 });
    }

    const backendRes = await fetch(BACKEND_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json({ error: text || "Backend error" }, { status: 502 });
    }

    const data = (await backendRes.json()) as { ok?: boolean; output?: string; error?: string; reply?: string; [k: string]: unknown };
    if (data && data.ok === false) {
      return NextResponse.json({ error: data.error || "Backend error" }, { status: 502 });
    }
    const reply = typeof data.reply === "string" ? data.reply : typeof data.output === "string" ? data.output : JSON.stringify(data);

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

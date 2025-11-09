// hackprinceton/app/api/fetch_trips/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_GET_TRIPS_URL = "http://backend:5001/get-trips";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Missing userId query parameter' },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_GET_TRIPS_URL}?user_id=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { ok: false, error: error?.error ?? 'Backend request failed' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json({ ok: true, trips: data.trips ?? [] });
  } catch (error) {
    console.error('fetch_trips route error', error);
    return NextResponse.json(
      { ok: false, error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
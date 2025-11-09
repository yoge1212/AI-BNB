// hackprinceton/app/api/fetch_trip/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_GET_TRIP_URL = 'http://backend:5001/get-trip';

export async function GET(request: NextRequest) {
  try {
    const tripId = request.nextUrl.searchParams.get('id');
    if (!tripId) {
      return NextResponse.json(
        { ok: false, error: 'Missing tripId query parameter' },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_GET_TRIP_URL}/${tripId}`,
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
    return NextResponse.json({ ok: true, trip: data.trip ?? null });
  } catch (error) {
    console.error('fetch_trip route error', error);
    return NextResponse.json(
      { ok: false, error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}


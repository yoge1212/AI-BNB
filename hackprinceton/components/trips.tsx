'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Trip = {
  id: string;
  trip_name: string;
  description?: string;
  uid: string;
  user_id: string;
  created_at?: string;
};

type TripsResponse =
  | { ok: true; trips: Trip[] }
  | { ok: false; error: string };

interface TripsProps {
  userId: string;
}

export default function Trips({ userId }: TripsProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/fetch_trips?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        const data: TripsResponse = await response.json();

        if (!cancelled) {
          if (response.ok && data.ok) {
            setTrips(data.trips);
          } else {
            setError(data.ok ? 'Failed to load trips' : data.error);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unexpected error');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (!userId) {
      setIsLoading(false);
      setTrips([]);
      setError('Missing user id');
      return;
    }

   

    loadTrips();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const formatCreatedAt = (createdAt?: string) => {
    if (!createdAt) {
      return null;
    }

    try {
      return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(createdAt));
    } catch {
      return null;
    }
  };

  const renderHero = () => (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-white shadow-xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Your Adventures</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Plan. Share. Explore.</h2>
          <p className="mt-3 max-w-xl text-base text-slate-200 sm:text-lg">
            Review saved itineraries, co-plan with friends, and dive back into the details in one click.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/20 bg-white/5 px-5 py-4 backdrop-blur">
          <span className="text-xs uppercase tracking-[0.45em] text-slate-300">
            Trips Saved
          </span>
          <span className="text-4xl font-semibold">{trips.length}</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {renderHero()}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white/40 p-6 shadow-sm"
            >
              <div className="h-4 w-1/3 rounded-full bg-slate-200" />
              <div className="mt-3 h-4 w-2/3 rounded-full bg-slate-100" />
              <div className="mt-6 space-y-2">
                <div className="h-3 w-full rounded-full bg-slate-100" />
                <div className="h-3 w-5/6 rounded-full bg-slate-100" />
                <div className="h-3 w-1/2 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        <p className="font-medium">We hit a snag.</p>
        <p className="mt-1 text-red-600">{error}</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 px-8 py-10 text-center text-slate-600">
        <h3 className="text-lg font-semibold text-slate-700">No trips yet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Start by creating your first adventure and it will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderHero()}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="group relative flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/trip/${trip.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                router.push(`/trip/${trip.id}`);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {trip.trip_name?.trim() || 'Unnamed Trip'}
              </h3>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                {formatCreatedAt(trip.created_at) ?? 'Draft'}
              </span>
            </div>
            {trip.description ? (
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {trip.description}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-slate-400">No description added yet.</p>
            )}
            <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
              <span className="font-medium">Shared ID</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                {trip.id}
              </span>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 scale-x-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-transform duration-300 group-hover:scale-x-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
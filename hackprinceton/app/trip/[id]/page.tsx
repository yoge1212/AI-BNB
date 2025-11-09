'use client';
import ChatBox from '@/components/chat-box';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

type Trip = {
  id: string;
  trip_name: string;
  description?: string;
  uid?: string;
  user_id: string;
  created_at?: string;
};

type TripResponse =
  | { ok: true; trip: Trip[] | Trip | null }
  | { ok: false; error: string };

export default function TripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Missing trip ID');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTrip() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/fetch_trip?id=${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        const data: TripResponse = await response.json();

        if (!cancelled) {
          if (response.ok && data.ok && data.trip) {
            // Normalize array vs object
            const tripData = Array.isArray(data.trip)
              ? data.trip[0]
              : data.trip;

            // Coerce id to string (backend returns number)
            setTrip(tripData ? { ...tripData, id: String(tripData.id) } : null);
          } else {
            setError(data.ok ? 'Failed to load trip' : data.error);
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

    loadTrip();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const formattedCreatedAt = useMemo(() => {
    if (!trip?.created_at) {
      return null;
    }

    try {
      return new Intl.DateTimeFormat('en', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(trip.created_at));
    } catch {
      return null;
    }
  }, [trip?.created_at]);

  const renderLoadingState = () => (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-14">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="h-4 w-40 rounded-full bg-white/20" />
            <div className="h-10 w-64 rounded-full bg-white/30" />
            <div className="h-16 w-80 rounded-2xl bg-white/10" />
          </div>
          <div className="h-24 w-48 rounded-2xl border border-white/20 bg-white/10" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-32 rounded-full bg-slate-200" />
          <div className="h-3 w-48 rounded-full bg-slate-100" />
          <div className="h-3 w-40 rounded-full bg-slate-100" />
          <div className="h-3 w-36 rounded-full bg-slate-100" />
        </div>
        <div className="h-64 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-32 rounded-full bg-slate-200" />
          <div className="mt-6 space-y-3">
            <div className="h-3 w-full rounded-full bg-slate-100" />
            <div className="h-3 w-11/12 rounded-full bg-slate-100" />
            <div className="h-3 w-10/12 rounded-full bg-slate-100" />
            <div className="h-3 w-4/6 rounded-full bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return renderLoadingState();
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 px-8 py-10 text-rose-700 shadow-sm">
          <h2 className="text-lg font-semibold text-rose-800">We couldn’t load this trip</h2>
          <p className="mt-3 text-sm">{error}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.35em] text-rose-400">
            Please try again in a moment
          </p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-8 py-10 text-center text-slate-600 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Trip unavailable</h2>
          <p className="mt-3 text-sm">
            The adventure you’re looking for may have been removed or you don’t have access.
          </p>
        </div>
      </div>
    );
  }

  const description = trip.description?.trim();

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-14">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs uppercase tracking-[0.45em] text-slate-300">Trip Overview</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              {trip.trip_name?.trim() || 'Untitled Adventure'}
            </h1>
            <p className="text-base text-slate-100 sm:text-lg">
              {description ||
                'Bring your itinerary to life, coordinate with friends, and capture every moment along the way.'}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-5 backdrop-blur">
            <span className="text-xs uppercase tracking-[0.45em] text-slate-200">
              Shared Trip ID
            </span>
            <span className="text-2xl font-semibold">{trip.id}</span>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-slate-200">
              {formattedCreatedAt ?? 'Draft Mode'}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[2fr_3fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Trip Details
            </h2>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              aria-label="Add collaborator"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M10 4.167v11.666M4.167 10h11.666"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <dl className="space-y-4 text-sm text-slate-600">
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Trip Name
              </dt>
              <dd className="text-base text-slate-900">
                {trip.trip_name?.trim() || 'Untitled Adventure'}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Description
              </dt>
              <dd className="text-sm leading-6 text-slate-600">
                {description || 'No description provided yet. Add one to capture the vibe of this trip.'}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Owner
              </dt>
              <dd className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {trip.user_id}
              </dd>
            </div>
            {formattedCreatedAt && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Created
                </dt>
                <dd className="text-sm text-slate-600">{formattedCreatedAt}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-0 shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Trip Collaboration
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Coordinate plans, ask questions, and capture ideas in real time with your crew.
            </p>
          </div>
          <div className="px-6 py-5">
            <ChatBox />
          </div>
        </div>
      </section>

      {isInviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-label="Close invite modal"
            onClick={() => setIsInviteModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="invite-modal-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Invite collaborator
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Send an invite link to join this trip.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                aria-label="Close"
                onClick={() => setIsInviteModalOpen(false)}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="m6 6 8 8M14 6l-8 8"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <label className="block text-sm font-medium text-slate-700">
                Email address
                <input
                  type="email"
                  name="collaboratorEmail"
                  required
                  placeholder="friend@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

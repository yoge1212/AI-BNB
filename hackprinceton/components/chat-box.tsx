"use client";

import { createClient } from "@/lib/supabase/client";
import { FormEvent, ChangeEvent, useState, useRef, useEffect } from "react";
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import React from 'react';

type PlannedActivity = {
  day?: number;
  time?: string;
  location_name?: string;
  description?: string;
};

type DailyForecast = {
  day?: number;
  date?: string;
  weather?: string;
};

type TripPlan = {
  trip_name?: string;
  summary?: string;
  selected_airbnb?: {
    title?: string;
    location?: string;
    price_per_night?: number;
  };
  daily_forecast?: DailyForecast[];
  planned_activities?: PlannedActivity[];
};

type TripChatMessage = {
  role: "assistant";
  content: string;
  type: "trip";
  tripPlan: TripPlan;
};

type TextChatMessage = {
  role: "user" | "assistant";
  content: string;
  type?: "text";
};

type ChatMessage = TripChatMessage | TextChatMessage;

interface MessageResponse {
  ok: boolean;
  output: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial user
    const initUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    initUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // We save and sanitize the history *before* adding the new message.
    // This is what the agent's prompt expects.
    const historyForBackend = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev: ChatMessage[]) => [
      ...prev,
      { role: "user" as const, content: trimmed, type: "text" },
    ]);
    setInput("");
    setLoading(true);

    try {
      if (!user) {
        throw new Error("Please log in to send messages");
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: historyForBackend,
          user_id: user.id, // Now we know user exists
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        // This 'text' will be the JSON error from your Flask app
        // e.g., "{"error": "Backend error", "ok": false}"
        console.error("Server Error Response:", text);
        throw new Error(text || "Request failed");
      }
      const data = (await res.json()) as {
        reply?: string;
        trip?: boolean;
        trip_response?: unknown;
      };

      if (data.trip) {
        try {
          const parsed =
            typeof data.trip_response === "string"
              ? JSON.parse(data.trip_response)
              : data.trip_response;

          if (!parsed || typeof parsed !== "object") {
            throw new Error("Trip response is not a valid JSON object");
          }

          const tripPlan = parsed as TripPlan;

          setMessages((prev: ChatMessage[]) => [
            ...prev,
            {
              role: "assistant",
              content: tripPlan.summary || "Here's your trip plan!",
              type: "trip",
              tripPlan,
            },
          ]);
        } catch (parseError) {
          console.error("Failed to parse trip response", parseError);
          setMessages((prev: ChatMessage[]) => [
            ...prev,
            {
              role: "assistant",
              content: "Sorry, I couldn't read the trip details that came back.",
              type: "text",
            },
          ]);
        }
        return;
      }

      if (typeof data.reply === "string") {
        const replyText = data.reply;
        setMessages((prev: ChatMessage[]) => [
          ...prev,
          { role: "assistant", content: replyText, type: "text" },
        ]);
      } else {
        setMessages((prev: ChatMessage[]) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I didn't understand that response.",
            type: "text",
          },
        ]);
      }
    } catch (err: unknown) {
      // The catch block now shows a more useful error
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, something went wrong. ${err instanceof Error ? err.message : ""}`,
        },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
    console.log(messages);
  }

  return (
    <div className="w-full max-w-3xl mx-auto border rounded-md bg-background/50">
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Start a conversation below.</p>
        ) : (
          messages.map((m: ChatMessage, idx: number) => (
            <React.Fragment key={idx}>
              {m.type === "trip" && "tripPlan" in m ? (
                <div className="mr-auto max-w-[85%] rounded-lg border bg-muted px-4 py-3">
                  <div className="space-y-3">
                    <div>
                      {m.tripPlan.trip_name ? (
                        <p className="text-sm font-semibold">{m.tripPlan.trip_name}</p>
                      ) : null}
                      {m.tripPlan.summary ? (
                        <p className="text-sm text-muted-foreground">{m.tripPlan.summary}</p>
                      ) : null}
                    </div>

                    {m.tripPlan.selected_airbnb ? (
                      <div className="rounded-md border bg-background p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Stay
                        </p>
                        {m.tripPlan.selected_airbnb.title ? (
                          <p className="text-sm font-medium">
                            {m.tripPlan.selected_airbnb.title}
                          </p>
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                          {[
                            m.tripPlan.selected_airbnb.location,
                            m.tripPlan.selected_airbnb.price_per_night
                              ? `$${m.tripPlan.selected_airbnb.price_per_night}/night`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      </div>
                    ) : null}

                    {Array.isArray(m.tripPlan.daily_forecast) &&
                    m.tripPlan.daily_forecast.length > 0 ? (
                      <div className="rounded-md border bg-background p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Forecast
                        </p>
                        <div className="mt-2 space-y-2">
                          {m.tripPlan.daily_forecast.map((forecast, forecastIdx) => (
                            <div key={forecastIdx} className="text-xs text-muted-foreground">
                              <p className="font-medium text-foreground">
                                {forecast.day ? `Day ${forecast.day}` : null}
                                {forecast.date ? (
                                  <span className="ml-1 text-muted-foreground">
                                    {forecast.date}
                                  </span>
                                ) : null}
                              </p>
                              {forecast.weather ? <p>{forecast.weather}</p> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {Array.isArray(m.tripPlan.planned_activities) &&
                    m.tripPlan.planned_activities.length > 0 ? (
                      <div className="space-y-2">
                        {m.tripPlan.planned_activities.map((activity, activityIdx) => (
                          <div
                            key={activityIdx}
                            className="rounded-md border bg-background px-3 py-2 text-sm"
                          >
                            <p className="font-semibold">
                              {[
                                activity.day ? `Day ${activity.day}` : null,
                                activity.time,
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                            {activity.location_name ? (
                              <p className="text-sm text-foreground">{activity.location_name}</p>
                            ) : null}
                            {activity.description ? (
                              <p className="text-xs text-muted-foreground">
                                {activity.description}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-lg px-3 py-2 bg-primary text-primary-foreground"
                      : "mr-auto max-w-[85%] rounded-lg px-3 py-2 bg-muted"
                  }
                >
                  {m.content}
                </div>
              )}
            </React.Fragment>
          ))
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t p-3">
        <input
          className="flex-1 bg-transparent outline-none px-3 py-2 rounded-md border"
          placeholder="Type your message..."
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-md border font-medium hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
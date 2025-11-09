"use client";

import { createClient } from "@/lib/supabase/client";
import { FormEvent, ChangeEvent, useState, useRef, useEffect } from "react";
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import React from 'react';

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

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

    // We save the history *before* adding the new message.
    // This is what the agent's prompt expects.
    const currentHistory = messages;

    setMessages((prev: ChatMessage[]) => [...prev, { role: "user" as const, content: trimmed }]);
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
          history: currentHistory,
          user_id: user.id  // Now we know user exists
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        // This 'text' will be the JSON error from your Flask app
        // e.g., "{"error": "Backend error", "ok": false}"
        console.error("Server Error Response:", text);
        throw new Error(text || "Request failed");
      }

      const data = (await res.json()) as { reply: string };
      setMessages((prev: ChatMessage[]) => [...prev, { role: "assistant", content: data.reply }]);
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
            <div
              key={idx}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-lg px-3 py-2 bg-primary text-primary-foreground"
                  : "mr-auto max-w-[85%] rounded-lg px-3 py-2 bg-muted"
              }
            >
              {m.content}
            </div>
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
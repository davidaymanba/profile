"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChatMessage } from "@/lib/chat-types";

const SESSION_KEY = "md-portfolio-chat-session";

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (sid: string) => {
    const response = await fetch(`/api/chat?sessionId=${sid}`, {
      cache: "no-store",
    });
    if (!response.ok) return;
    const data = await response.json();
    if (data.enabled) setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    if (!sessionId || !open) return;

    setLoading(true);
    loadMessages(sessionId).finally(() => setLoading(false));

    const interval = setInterval(() => loadMessages(sessionId), 4000);
    return () => clearInterval(interval);
  }, [sessionId, open, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId || !content.trim()) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          content,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to send");

      setMessages((prev) => [...prev, data.message]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const showIntroFields = messages.length === 0;

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex h-[min(520px,70vh)] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] shadow-[var(--shadow)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              <div>
                <p className="font-display text-sm font-bold text-navy-deep">
                  Chat with David
                </p>
                <p className="text-xs text-ink-muted">Usually replies soon</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg px-2 py-1 text-ink-muted hover:bg-bg-soft"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loading && messages.length === 0 ? (
                <p className="text-sm text-ink-muted">Loading...</p>
              ) : null}

              {messages.length === 0 && !loading ? (
                <p className="rounded-xl bg-bg-soft p-3 text-sm text-ink-muted">
                  Hi! Send a message about work, projects, or opportunities.
                </p>
              ) : null}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.sender === "visitor"
                        ? "bg-navy text-btn-fg"
                        : "border border-[var(--line)] bg-[var(--surface)] text-ink"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-[var(--line)] p-3">
              {showIntroFields ? (
                <div className="mb-2 grid gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-accent/50"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email (optional)"
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-accent/50"
                  />
                </div>
              ) : null}
              <div className="flex gap-2">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type a message..."
                  className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-accent/50"
                />
                <button
                  type="submit"
                  disabled={sending || !content.trim()}
                  className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? "Close chat" : "Open chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[0_12px_40px_rgba(26,122,184,0.45)] transition hover:bg-accent-strong"
      >
        {open ? (
          <span className="text-xl">✕</span>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H9l-4.8 3.2A1 1 0 0 1 3 18.4V5.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </motion.button>
    </div>
  );
}

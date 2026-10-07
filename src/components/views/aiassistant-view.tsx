"use client";

import * as React from "react";
import { BookOpen, GraduationCap, Languages, Lightbulb, ListChecks, Loader2, Send, Sparkles, Wand2 } from "lucide-react";
import { useDataStore, mutations } from "@/lib/data";
import { ViewHeader } from "./shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { apiSend, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

// AI Study Assistant — quick-action modes (the reference's six chips) plus a
// free chat with persisted history.

const MODES = [
  { id: "explain", label: "Explain Concept", icon: BookOpen, hint: "Explain photosynthesis like I'm 15" },
  { id: "tips", label: "Study Tips", icon: Lightbulb, hint: "How do I memorize vocabulary faster?" },
  { id: "summarize", label: "Summarize", icon: ListChecks, hint: "Summarize the causes of WWI" },
  { id: "solve", label: "Solve Problem", icon: Wand2, hint: "A train leaves at 3pm travelling 80 km/h…" },
  { id: "translate", label: "Translate", icon: Languages, hint: "Translate: better late than never" },
  { id: "essay", label: "Essay Ideas", icon: GraduationCap, hint: "Essay angles on The Great Gatsby" },
] as const;

export function AIAssistantView() {
  const messages = useDataStore((s) => s.data.chat);
  const load = useDataStore((s) => s.load);
  const appendChat = useDataStore((s) => s.appendChat);
  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<(typeof MODES)[number]["id"] | null>(null);
  const [busy, setBusy] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    void load("chat");
  }, [load]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy]);

  async function send(text?: string, forcedMode?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setBusy(true);
    setInput("");
    const usedMode = forcedMode ?? mode ?? "chat";
    appendChat({
      id: `local-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    });
    try {
      const res = await apiSend<{ message: { id: string; role: "assistant"; content: string; createdAt: string } }>(
        "POST",
        "/api/ai/chat",
        { messages: [{ role: "user", content }], mode: usedMode },
      );
      appendChat(res.message);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "The assistant is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ViewHeader title="AI Study Assistant" subtitle="Your personal AI tutor, available 24/7" icon={Sparkles} />

      {/* Quick actions — S5-N: measured cards: p-4 bg-white rounded-xl
          border-slate-200 hover:border-violet-300 hover:shadow-lg, 32px
          accent icon + 16px/600 title (no description line). The hints
          still seed the input on click. */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id);
              setInput(m.hint);
            }}
            className={cn(
              "group rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-sf-primary/50 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900",
              mode === m.id && "border-sf-primary/60",
            )}
            aria-pressed={mode === m.id}
          >
            <m.icon
              className="h-8 w-8 text-sf-primary"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <h3 className="mt-2 text-base font-semibold text-slate-800 dark:text-slate-100">{m.label}</h3>
          </button>
        ))}
      </div>

      {/* Chat — S5-N: measured card: rounded-2xl border-slate-200 shadow-sm
          min-h-[500px], message pane p-6, composer border-t p-4 with a 60px
          textarea + 60px gradient send button and the hint line. */}
      <div className="flex min-h-[500px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="sf-scroll flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
              <Sparkles className="h-10 w-10 text-slate-200 dark:text-slate-700" strokeWidth={1.5} />
              <p className="text-[15px] font-semibold text-slate-600 dark:text-slate-300">
                How can I help you study today?
              </p>
              <p className="max-w-sm text-sm text-slate-400">
                Pick a quick action above or just ask below.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {messages.map((m) => (
                <li key={m.id} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
                  {m.role === "assistant" && (
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: "rgb(var(--sf-primary))" }}
                      aria-hidden="true"
                    >
                      <Sparkles className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
                      m.role === "user"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
                    )}
                  >
                    {m.content}
                  </div>
                </li>
              ))}
              {busy && (
                <li className="flex gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: "rgb(var(--sf-primary))" }}
                    aria-hidden="true"
                  >
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-400">Thinking…</span>
                  </div>
                </li>
              )}
              <div ref={bottomRef} />
            </ul>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode ? `${MODES.find((m) => m.id === mode)?.label} — ask away…` : "Ask me anything..."}
              aria-label="Message the assistant"
              rows={2}
              className="max-h-40 min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              maxLength={8000}
            />
            <Button
              type="submit"
              variant="gradient"
              size="icon"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="h-[60px] w-[60px] shrink-0"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
          <p className="mt-2 text-xs text-slate-400">Press Enter to send, Shift + Enter for a new line</p>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                void mutations.clearChat();
                toast.success("Chat cleared");
              }}
              className="mt-1 text-xs text-slate-400 hover:text-slate-600 sf-focus dark:hover:text-slate-300"
            >
              Clear conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

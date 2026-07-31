import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askLinksOS } from "@/lib/links-os.functions";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain quantum entanglement simply",
  "Help me with my math homework",
  "Write a Python script to rename files",
  "Give me study tips for exams",
  "Find a science group",
  "Open my chats",
];

export function LinksOS() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi — I'm **Link OS**. Ask me anything: homework, code, science, advice, writing — or let me find groups, draft posts and take you around the app." },
  ]);
  const ask = useServerFn(askLinksOS);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { reply, route } = await ask({ data: { messages: next } });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (route) {
        setTimeout(() => {
          setOpen(false);
          navigate({ to: route as "/home" });
        }, 600);
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: "assistant", content: "Something glitched on my end. Try again?" }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating Orb */}
      <button
        aria-label="Open Link OS assistant"
        onClick={() => setOpen((v) => !v)}
        className="press press-glow fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-110 focus-visible:rounded-full"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Sparkles className={`h-6 w-6 ${open ? "rotate-180" : ""} transition-transform`} aria-hidden="true" />
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Link OS"
          className="fixed inset-x-2 bottom-2 z-50 mx-auto flex max-w-md flex-col overflow-hidden rounded-3xl border border-border backdrop-blur-2xl sm:right-4 sm:left-auto sm:bottom-44 sm:w-96"
          style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-elegant, 0 20px 60px -20px rgba(0,0,0,0.6))", maxHeight: "min(80vh, 600px)" }}
        >
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Link OS</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">AI inside Links</p>
              </div>
            </div>
            <button
              aria-label="Close Link OS"
              onClick={() => setOpen(false)}
              className="press rounded-full p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[90%] text-sm leading-relaxed text-foreground"
                  }
                  style={m.role === "user" ? { background: "var(--gradient-primary)" } : undefined}
                >
                  {m.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Link OS is thinking…
              </div>
            )}
            {messages.length === 1 && !busy && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="press rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t border-border bg-background/40 p-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask Link OS anything…"
              aria-label="Message Link OS"
              className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-card/60 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="press press-glow flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-foreground disabled:opacity-40"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
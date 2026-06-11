import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/chats")({
  head: () => ({ meta: [{ title: "Chats — Links" }] }),
  component: Chats,
});

const seed = [
  { from: "them", text: "Hey! Saw your post about the science project — count me in." },
  { from: "me", text: "Amazing 💜 Want to brainstorm tonight at 8?" },
  { from: "them", text: "Perfect. I'll bring some articles on solar." },
];

function Chats() {
  const [msgs, setMsgs] = useState(seed);
  const [text, setText] = useState("");
  return (
    <AppShell title="Renewable Energy Club">
      <div className="space-y-3 pb-24">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.from === "me"
                  ? "text-primary-foreground"
                  : "border border-border bg-card text-foreground"
              }`}
              style={m.from === "me" ? { background: "var(--gradient-primary)" } : undefined}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setMsgs([...msgs, { from: "me", text: text.trim() }]);
          setText("");
        }}
        className="fixed bottom-20 left-0 right-0 z-40 px-4"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card/90 p-1.5 backdrop-blur-xl">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
            className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="press press-glow flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </AppShell>
  );
}
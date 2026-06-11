import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { Search, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover — Links" }] }),
  component: Discover,
});

const people = [
  { name: "Maya K.", handle: "maya_k", country: "🇮🇳 India" },
  { name: "Devraj S.", handle: "devraj", country: "🇬🇧 UK" },
  { name: "Ines B.", handle: "ines.b", country: "🇵🇹 Portugal" },
  { name: "Kojo A.", handle: "kojo", country: "🇬🇭 Ghana" },
];
const groups = [
  { name: "Renewable Energy Club", members: 1240 },
  { name: "Indie Game Devs", members: 3210 },
  { name: "Climate Action Now", members: 8420 },
  { name: "Sketchbook Sunday", members: 612 },
];

function Discover() {
  const [q, setQ] = useState("");
  return (
    <AppShell title="Discover">
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people, groups, topics…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">People</h2>
      <div className="mb-8 space-y-2">
        {people
          .filter((p) => (p.name + p.handle).toLowerCase().includes(q.toLowerCase()))
          .map((p) => (
            <Link
              to="/chats"
              key={p.handle}
              className="press flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                {p.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">@{p.handle} · {p.country}</div>
              </div>
              <button className="press press-sm rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold text-primary-glow">
                Chat
              </button>
            </Link>
          ))}
      </div>

      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Groups</h2>
      <div className="space-y-2">
        {groups
          .filter((g) => g.name.toLowerCase().includes(q.toLowerCase()))
          .map((g) => (
            <div
              key={g.name}
              className="press flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.members.toLocaleString()} members</div>
              </div>
              <button className="press press-sm rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold text-primary-glow">
                Join
              </button>
            </div>
          ))}
      </div>
    </AppShell>
  );
}
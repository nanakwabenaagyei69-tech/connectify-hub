import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { Search, Heart, MessageSquare, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — Links" }] }),
  component: HomePage,
});

const topics = [
  { name: "Science", emoji: "🔬", hue: "from-purple-500 to-fuchsia-500" },
  { name: "Music", emoji: "🎧", hue: "from-violet-500 to-purple-500" },
  { name: "Gaming", emoji: "🎮", hue: "from-fuchsia-500 to-pink-500" },
  { name: "Sports", emoji: "⚽", hue: "from-purple-600 to-indigo-500" },
  { name: "Climate", emoji: "🌍", hue: "from-violet-600 to-purple-500" },
  { name: "Art", emoji: "🎨", hue: "from-pink-500 to-purple-500" },
];

const posts = [
  { user: "maya_k", topic: "Science", time: "3m", body: "Group project on renewable energy — anyone want to brainstorm tonight?", likes: 24, comments: 8 },
  { user: "devraj", topic: "Gaming", time: "21m", body: "Hosting a casual tournament Saturday. All skill levels welcome 💜", likes: 102, comments: 31 },
  { user: "ines.b", topic: "Climate", time: "1h", body: "Local cleanup this weekend in Lisbon. Bring friends — every hand counts.", likes: 56, comments: 12 },
];

function HomePage() {
  return (
    <AppShell title="Home">
      <Link
        to="/discover"
        className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-muted-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search people, groups, topics…</span>
      </Link>

      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Choose a topic</h2>
      <div className="mb-8 grid grid-cols-3 gap-3">
        {topics.map((t) => (
          <button
            key={t.name}
            className={`press press-glow relative overflow-hidden rounded-2xl bg-gradient-to-br ${t.hue} p-4 text-left transition-transform hover:-translate-y-0.5`}
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="text-2xl">{t.emoji}</div>
            <div className="mt-2 text-sm font-bold text-white">{t.name}</div>
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary-glow" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trending</h2>
      </div>
      <div className="space-y-3">
        {posts.map((p, i) => (
          <article
            key={i}
            className="press rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                {p.user[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">@{p.user}</div>
                <div className="text-xs text-muted-foreground">
                  in <span className="text-primary-glow">{p.topic}</span> · {p.time}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed">{p.body}</p>
            <div className="mt-3 flex items-center gap-5 text-xs text-muted-foreground">
              <button className="press press-sm flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-primary-glow">
                <Heart className="h-4 w-4" /> {p.likes}
              </button>
              <button className="press press-sm flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-primary-glow">
                <MessageSquare className="h-4 w-4" /> {p.comments}
              </button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
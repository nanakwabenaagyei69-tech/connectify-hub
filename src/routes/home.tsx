import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { Heart, MessageSquare, Send, Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, initials } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — Links" }] }),
  component: HomePage,
});

const TOPICS = ["Science", "Music", "Gaming", "Sports", "Climate", "Art", "Coding", "General"];

type Post = {
  id: string;
  author_id: string;
  topic: string;
  body: string;
  created_at: string;
  author: { username: string; display_name: string | null; avatar_url: string | null } | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("Science");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase
      .from("posts")
      .select("id, author_id, topic, body, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (filter) query = query.eq("topic", filter);
    const { data: rows, error } = await query;
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const ids = (rows ?? []).map((r) => r.id);
    const authorIds = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
    const [{ data: profs }, { data: likes }, { data: myLikes }, { data: comments }] = await Promise.all([
      authorIds.length
        ? supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", authorIds)
        : Promise.resolve({ data: [] as any[] }),
      ids.length ? supabase.from("post_likes").select("post_id").in("post_id", ids) : Promise.resolve({ data: [] as any[] }),
      ids.length ? supabase.from("post_likes").select("post_id").in("post_id", ids).eq("user_id", user.id) : Promise.resolve({ data: [] as any[] }),
      ids.length ? supabase.from("comments").select("post_id").in("post_id", ids) : Promise.resolve({ data: [] as any[] }),
    ]);
    const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
    const likeCount = new Map<string, number>();
    (likes ?? []).forEach((l: any) => likeCount.set(l.post_id, (likeCount.get(l.post_id) ?? 0) + 1));
    const commentCount = new Map<string, number>();
    (comments ?? []).forEach((c: any) => commentCount.set(c.post_id, (commentCount.get(c.post_id) ?? 0) + 1));
    const mine = new Set((myLikes ?? []).map((l: any) => l.post_id));
    setPosts(
      (rows ?? []).map((r) => ({
        ...r,
        author: profMap.get(r.author_id) ?? null,
        like_count: likeCount.get(r.id) ?? 0,
        comment_count: commentCount.get(r.id) ?? 0,
        liked_by_me: mine.has(r.id),
      })),
    );
    setLoading(false);
  }, [user, filter]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: refresh on any post change
  useEffect(() => {
    const ch = supabase
      .channel("posts-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !body.trim() || posting) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      topic,
      body: body.trim(),
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBody("");
    toast.success("Posted");
  }

  async function toggleLike(p: Post) {
    if (!user) return;
    // Optimistic
    setPosts((arr) =>
      arr.map((x) =>
        x.id === p.id ? { ...x, liked_by_me: !x.liked_by_me, like_count: x.like_count + (x.liked_by_me ? -1 : 1) } : x,
      ),
    );
    if (p.liked_by_me) {
      await supabase.from("post_likes").delete().eq("post_id", p.id).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: p.id, user_id: user.id });
    }
  }

  return (
    <AppShell title="Home">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Choose a topic</h2>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`press rounded-full border px-3 py-1.5 text-xs font-semibold ${
            filter === null ? "border-primary text-primary-glow" : "border-border text-muted-foreground"
          }`}
        >
          All
        </button>
        {TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`press rounded-full border px-3 py-1.5 text-xs font-semibold ${
              filter === t ? "border-primary text-primary-glow" : "border-border text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="mb-6 rounded-2xl border border-border bg-card p-3"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Share something with your topic…"
          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!body.trim() || posting}
            className="press press-glow flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            {posting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Post
          </button>
        </div>
      </form>

      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary-glow" aria-hidden="true" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Feed</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Be the first to post in this topic.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                  aria-hidden="true"
                >
                  {initials(p.author)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">@{p.author?.username ?? "user"}</div>
                  <div className="text-xs text-muted-foreground">
                    in <span className="text-primary-glow">{p.topic}</span> · {timeAgo(p.created_at)}
                  </div>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{p.body}</p>
              <div className="mt-3 flex items-center gap-5 text-xs text-muted-foreground">
                <button
                  onClick={() => toggleLike(p)}
                  className={`press press-sm flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors ${
                    p.liked_by_me ? "text-primary-glow" : "hover:text-primary-glow"
                  }`}
                  aria-label="Like"
                >
                  <Heart className={`h-4 w-4 ${p.liked_by_me ? "fill-current" : ""}`} aria-hidden="true" /> {p.like_count}
                </button>
                <span className="flex items-center gap-1.5 px-2 py-1">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" /> {p.comment_count}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
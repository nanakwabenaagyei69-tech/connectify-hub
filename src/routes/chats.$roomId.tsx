import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, initials } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/chats/$roomId")({
  head: () => ({ meta: [{ title: "Chat — Links" }] }),
  component: RoomPage,
});

type Message = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: { username: string; display_name: string | null } | null;
};

function RoomPage() {
  const { roomId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [room, setRoom] = useState<{ name: string } | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const profCache = useRef(new Map<string, { username: string; display_name: string | null }>());
  const endRef = useRef<HTMLDivElement>(null);

  const enrichAuthor = useCallback(async (m: Omit<Message, "author">): Promise<Message> => {
    if (profCache.current.has(m.author_id)) return { ...m, author: profCache.current.get(m.author_id) };
    const { data } = await supabase.from("profiles").select("username, display_name").eq("id", m.author_id).maybeSingle();
    if (data) profCache.current.set(m.author_id, data);
    return { ...m, author: data ?? null };
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: r } = await supabase.from("chat_rooms").select("name").eq("id", roomId).maybeSingle();
    setRoom(r);
    const { data: rows, error } = await supabase
      .from("messages")
      .select("id, author_id, body, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) { toast.error(error.message); setLoading(false); return; }
    const authorIds = Array.from(new Set((rows ?? []).map((m) => m.author_id)));
    if (authorIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, username, display_name").in("id", authorIds);
      (profs ?? []).forEach((p: any) => profCache.current.set(p.id, p));
    }
    setMsgs((rows ?? []).map((m) => ({ ...m, author: profCache.current.get(m.author_id) ?? null })));
    setLoading(false);
  }, [user, roomId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const m = payload.new as Omit<Message, "author">;
          const full = await enrichAuthor(m);
          setMsgs((arr) => (arr.some((x) => x.id === full.id) ? arr : [...arr, full]));
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId, enrichAuthor]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    const body = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({ room_id: roomId, author_id: user.id, body });
    if (error) { toast.error(error.message); setText(body); }
  }

  return (
    <AppShell title={room?.name ?? "Chat"}>
      <button
        onClick={() => nav({ to: "/chats" })}
        className="press mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> All chats
      </button>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2 pb-28">
          {msgs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              Say hi 👋
            </div>
          )}
          {msgs.map((m) => {
            const mine = m.author_id === user?.id;
            return (
              <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                    {initials(m.author)}
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  mine ? "text-primary-foreground" : "border border-border bg-card text-foreground"
                }`} style={mine ? { background: "var(--gradient-primary)" } : undefined}>
                  {!mine && <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-glow">@{m.author?.username ?? "user"}</div>}
                  <div className="whitespace-pre-wrap">{m.body}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      )}

      <form
        onSubmit={send}
        className="fixed bottom-20 left-0 right-0 z-40 px-4"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card/90 p-1.5 backdrop-blur-xl">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
            maxLength={4000}
            className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Send message"
            className="press press-glow flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </AppShell>
  );
}
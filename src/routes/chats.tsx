import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { MessageCircle, Users, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/chats")({
  head: () => ({ meta: [{ title: "Chats — Links" }] }),
  component: ChatsList,
});

type Room = {
  id: string;
  name: string;
  is_group: boolean;
  topic: string | null;
  last_message: string | null;
  last_at: string | null;
};

function ChatsList() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: mem } = await supabase.from("room_members").select("room_id").eq("user_id", user.id);
    const ids = (mem ?? []).map((m: any) => m.room_id);
    if (ids.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }
    const { data: rs } = await supabase.from("chat_rooms").select("id, name, is_group, topic").in("id", ids);
    const { data: msgs } = await supabase
      .from("messages")
      .select("room_id, body, created_at")
      .in("room_id", ids)
      .order("created_at", { ascending: false });
    const lastByRoom = new Map<string, { body: string; created_at: string }>();
    (msgs ?? []).forEach((m: any) => {
      if (!lastByRoom.has(m.room_id)) lastByRoom.set(m.room_id, { body: m.body, created_at: m.created_at });
    });
    const enriched: Room[] = (rs ?? []).map((r) => {
      const l = lastByRoom.get(r.id);
      return {
        id: r.id,
        name: r.name,
        is_group: r.is_group,
        topic: r.topic,
        last_message: l?.body ?? null,
        last_at: l?.created_at ?? null,
      };
    });
    enriched.sort((a, b) => (b.last_at ?? "").localeCompare(a.last_at ?? ""));
    setRooms(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel("rooms-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  return (
    <AppShell title="Chats">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No chats yet. Head to <Link to="/discover" className="text-primary-glow underline">Discover</Link> to join a group or message someone.
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((r) => (
            <Link
              key={r.id}
              to="/chats/$roomId"
              params={{ roomId: r.id }}
              className="press flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                {r.is_group ? <Users className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="truncate text-sm font-semibold">{r.name}</div>
                  {r.last_at && <span className="text-[10px] text-muted-foreground">{new Date(r.last_at).toLocaleDateString()}</span>}
                </div>
                <div className="truncate text-xs text-muted-foreground">{r.last_message ?? (r.topic ?? "No messages yet")}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { Search, Users, Plus, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, initials } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover — Links" }] }),
  component: Discover,
});

type Person = { id: string; username: string; display_name: string | null; avatar_url: string | null };
type Group = { id: string; name: string; topic: string | null; member_count: number; is_member: boolean };

function Discover() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTopic, setNewTopic] = useState("General");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: profs }, { data: rooms }, { data: memberships }] = await Promise.all([
      supabase.from("profiles").select("id, username, display_name, avatar_url").neq("id", user.id).limit(50),
      supabase.from("chat_rooms").select("id, name, topic").eq("is_group", true).limit(50),
      supabase.from("room_members").select("room_id").eq("user_id", user.id),
    ]);
    setPeople((profs ?? []) as Person[]);
    const myRooms = new Set((memberships ?? []).map((m: any) => m.room_id));
    const roomIds = (rooms ?? []).map((r) => r.id);
    let counts = new Map<string, number>();
    if (roomIds.length) {
      const { data: members } = await supabase.from("room_members").select("room_id").in("room_id", roomIds);
      (members ?? []).forEach((m: any) => counts.set(m.room_id, (counts.get(m.room_id) ?? 0) + 1));
    }
    setGroups(
      (rooms ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        topic: r.topic,
        member_count: counts.get(r.id) ?? 0,
        is_member: myRooms.has(r.id),
      })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function startDM(other: Person) {
    if (!user) return;
    // Find existing 1:1 room containing both
    const { data: mine } = await supabase.from("room_members").select("room_id").eq("user_id", user.id);
    const myIds = (mine ?? []).map((m: any) => m.room_id);
    if (myIds.length) {
      const { data: theirs } = await supabase
        .from("room_members")
        .select("room_id")
        .in("room_id", myIds)
        .eq("user_id", other.id);
      const shared = (theirs ?? [])[0]?.room_id;
      if (shared) {
        const { data: room } = await supabase.from("chat_rooms").select("is_group").eq("id", shared).single();
        if (room && !room.is_group) {
          nav({ to: "/chats/$roomId", params: { roomId: shared } });
          return;
        }
      }
    }
    const { data: room, error } = await supabase
      .from("chat_rooms")
      .insert({ name: `@${other.username}`, is_group: false, created_by: user.id })
      .select("id")
      .single();
    if (error || !room) { toast.error(error?.message ?? "Failed"); return; }
    await supabase.from("room_members").insert([
      { room_id: room.id, user_id: user.id },
      { room_id: room.id, user_id: other.id },
    ]);
    nav({ to: "/chats/$roomId", params: { roomId: room.id } });
  }

  async function joinGroup(g: Group) {
    if (!user) return;
    if (g.is_member) {
      nav({ to: "/chats/$roomId", params: { roomId: g.id } });
      return;
    }
    const { error } = await supabase.from("room_members").insert({ room_id: g.id, user_id: user.id });
    if (error) { toast.error(error.message); return; }
    toast.success(`Joined ${g.name}`);
    nav({ to: "/chats/$roomId", params: { roomId: g.id } });
  }

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newName.trim()) return;
    const { data: room, error } = await supabase
      .from("chat_rooms")
      .insert({ name: newName.trim(), topic: newTopic, is_group: true, created_by: user.id })
      .select("id")
      .single();
    if (error || !room) { toast.error(error?.message ?? "Failed"); return; }
    await supabase.from("room_members").insert({ room_id: room.id, user_id: user.id });
    setShowCreate(false); setNewName("");
    nav({ to: "/chats/$roomId", params: { roomId: room.id } });
  }

  const filt = q.toLowerCase();
  const peopleF = people.filter((p) => (p.username + (p.display_name ?? "")).toLowerCase().includes(filt));
  const groupsF = groups.filter((g) => (g.name + (g.topic ?? "")).toLowerCase().includes(filt));

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

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Groups</h2>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="press flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary-glow"
        >
          <Plus className="h-3 w-3" /> New
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createGroup} className="mb-4 rounded-2xl border border-border bg-card p-3 space-y-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Group name"
            maxLength={60}
            required
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
          />
          <div className="flex gap-2">
            <select value={newTopic} onChange={(e) => setNewTopic(e.target.value)} className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {["General", "Science", "Music", "Gaming", "Sports", "Climate", "Art", "Coding"].map((t) => <option key={t}>{t}</option>)}
            </select>
            <button type="submit" className="press press-glow rounded-full px-4 py-2 text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              Create
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="mb-8 space-y-2">
            {groupsF.length === 0 ? (
              <p className="text-sm text-muted-foreground">No groups yet — create the first.</p>
            ) : groupsF.map((g) => (
              <div key={g.id} className="press flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{g.name}</div>
                  <div className="text-xs text-muted-foreground">{g.topic ?? "General"} · {g.member_count} member{g.member_count === 1 ? "" : "s"}</div>
                </div>
                <button onClick={() => joinGroup(g)} className="press press-sm rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold text-primary-glow">
                  {g.is_member ? "Open" : "Join"}
                </button>
              </div>
            ))}
          </div>

          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">People</h2>
          <div className="space-y-2">
            {peopleF.length === 0 ? (
              <p className="text-sm text-muted-foreground">No one matches that search.</p>
            ) : peopleF.map((p) => (
              <div key={p.id} className="press flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  {initials(p)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{p.display_name ?? p.username}</div>
                  <div className="text-xs text-muted-foreground">@{p.username}</div>
                </div>
                <button onClick={() => startDM(p)} className="press press-sm rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold text-primary-glow">
                  Chat
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
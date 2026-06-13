import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { MapPin, Calendar, Plus, Check, Loader2, X } from "lucide-react";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const EventsMap = lazy(() => import("@/components/EventsMap"));

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — Links" }] }),
  component: Events,
});

type Event = {
  id: string;
  title: string;
  description: string;
  topic: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  starts_at: string;
  created_by: string;
  going_count: number;
  my_status: "going" | "interested" | null;
};

function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("events")
      .select("id, title, description, topic, location_name, latitude, longitude, starts_at, created_by")
      .order("starts_at", { ascending: true });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const ids = (rows ?? []).map((r) => r.id);
    const [{ data: rsvps }, { data: mine }] = await Promise.all([
      ids.length ? supabase.from("event_rsvps").select("event_id, status").in("event_id", ids) : Promise.resolve({ data: [] as any[] }),
      ids.length ? supabase.from("event_rsvps").select("event_id, status").in("event_id", ids).eq("user_id", user.id) : Promise.resolve({ data: [] as any[] }),
    ]);
    const goingCount = new Map<string, number>();
    (rsvps ?? []).forEach((r: any) => {
      if (r.status === "going") goingCount.set(r.event_id, (goingCount.get(r.event_id) ?? 0) + 1);
    });
    const myStatus = new Map<string, "going" | "interested">();
    (mine ?? []).forEach((r: any) => myStatus.set(r.event_id, r.status));
    setEvents((rows ?? []).map((r) => ({
      ...r,
      going_count: goingCount.get(r.id) ?? 0,
      my_status: myStatus.get(r.id) ?? null,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel("rsvps")
      .on("postgres_changes", { event: "*", schema: "public", table: "event_rsvps" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  async function rsvp(e: Event, status: "going" | "interested") {
    if (!user) return;
    if (e.my_status === status) {
      await supabase.from("event_rsvps").delete().eq("event_id", e.id).eq("user_id", user.id);
    } else {
      await supabase.from("event_rsvps").upsert({ event_id: e.id, user_id: user.id, status });
    }
  }

  const mappable = events.filter((e) => e.latitude != null && e.longitude != null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <AppShell title="Global Events">
      <div className="relative mb-4 h-56 overflow-hidden rounded-3xl border border-border">
        {mounted ? (
          <Suspense fallback={<div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading map…</div>}>
            <EventsMap events={mappable.map((e) => ({ id: e.id, title: e.title, location_name: e.location_name, latitude: e.latitude!, longitude: e.longitude!, starts_at: e.starts_at }))} />
          </Suspense>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading map…</div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Upcoming</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="press flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary-glow"
        >
          {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />} {showForm ? "Close" : "New event"}
        </button>
      </div>

      {showForm && <EventForm onCreated={() => { setShowForm(false); load(); }} />}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No events yet — be the first to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold">{e.title}</h3>
                  {e.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{e.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" /> {e.location_name || "Online"}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" aria-hidden="true" /> {new Date(e.starts_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-xs text-primary-glow">{e.going_count} going · {e.topic}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => rsvp(e, "going")}
                  className={`press press-glow flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold ${
                    e.my_status === "going" ? "text-primary-foreground" : "border border-border text-foreground"
                  }`}
                  style={e.my_status === "going" ? { background: "var(--gradient-primary)" } : undefined}
                >
                  {e.my_status === "going" && <Check className="h-3 w-3" />} Going
                </button>
                <button
                  onClick={() => rsvp(e, "interested")}
                  className={`press rounded-full px-4 py-1.5 text-xs font-semibold ${
                    e.my_status === "interested" ? "border border-primary text-primary-glow" : "border border-border text-muted-foreground"
                  }`}
                >
                  Interested
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function EventForm({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("General");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || busy) return;
    if (!title.trim() || !startsAt) {
      toast.error("Title and start time are required");
      return;
    }
    const latNum = lat ? Number(lat) : null;
    const lngNum = lng ? Number(lng) : null;
    if ((latNum != null && (latNum < -90 || latNum > 90)) || (lngNum != null && (lngNum < -180 || lngNum > 180))) {
      toast.error("Invalid coordinates");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("events").insert({
      title: title.trim(),
      description: description.trim(),
      topic,
      location_name: locationName.trim(),
      latitude: latNum,
      longitude: lngNum,
      starts_at: new Date(startsAt).toISOString(),
      created_by: user.id,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Event created");
    onCreated();
  }

  return (
    <form onSubmit={submit} className="mb-4 space-y-2 rounded-2xl border border-border bg-card p-3">
      <input required maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
      <div className="grid grid-cols-2 gap-2">
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
          {["General", "Science", "Music", "Gaming", "Sports", "Climate", "Art", "Coding"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <input required type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Location (e.g. Lisbon, Portugal)" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
      <div className="grid grid-cols-2 gap-2">
        <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude (optional)" inputMode="decimal" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
        <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude (optional)" inputMode="decimal" className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
      </div>
      <p className="text-[10px] text-muted-foreground">Tip: paste coordinates from Google Maps (right-click anywhere → copy lat/lng) to plot the event on the map.</p>
      <button type="submit" disabled={busy} className="press press-glow flex w-full items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create event"}
      </button>
    </form>
  );
}
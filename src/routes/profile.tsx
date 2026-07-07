import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { LogOut, Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, initials } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "You — Links" }] }),
  component: Profile,
});

const ALL_TOPICS = ["Science", "Music", "Gaming", "Sports", "Climate", "Art", "Coding"];

function Profile() {
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [age, setAge] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setTopics(profile.topics ?? []);
      setAge(profile.age != null ? String(profile.age) : "");
    }
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const parsedAge = age.trim() === "" ? null : Number(age);
    if (parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120)) {
      setSaving(false);
      toast.error("Age must be a whole number between 13 and 120");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null, bio: bio.trim() || null, topics, age: parsedAge })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
  }

  async function logout() {
    await signOut();
    nav({ to: "/auth", replace: true });
  }

  function toggleTopic(t: string) {
    setTopics((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));
  }

  return (
    <AppShell title="You">
      <div className="rounded-3xl border border-border p-6 text-center" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          {initials(profile)}
        </div>
        <h2 className="mt-4 text-xl font-bold">{profile?.display_name ?? profile?.username ?? "—"}</h2>
        <p className="text-sm text-muted-foreground">@{profile?.username ?? "…"}</p>
        {user?.email && <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>}
      </div>

      <form onSubmit={save} className="mt-6 space-y-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} className="mt-1 w-full rounded-2xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={3} className="mt-1 w-full resize-none rounded-2xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Age</label>
          <input
            value={age}
            onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
            inputMode="numeric"
            placeholder="14"
            className="mt-1 w-full rounded-2xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topics you care about</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_TOPICS.map((t) => {
              const on = topics.includes(t);
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleTopic(t)}
                  className={`press rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    on ? "border-primary text-primary-glow" : "border-border text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <button type="submit" disabled={saving} className="press press-glow flex w-full items-center justify-center gap-2 rounded-full py-3 font-semibold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save profile</>}
        </button>
      </form>

      <button
        onClick={logout}
        className="press mt-4 flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left text-destructive transition-colors hover:border-destructive/40"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span className="flex-1 text-sm font-semibold">Sign out</span>
      </button>
    </AppShell>
  );
}
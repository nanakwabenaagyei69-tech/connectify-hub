import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Loader2, Sparkles, Users, Star, BookOpen, Lightbulb, Ghost } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { exploreTopics } from "@/lib/topic-explorer.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Join Links" }] }),
  component: Auth,
});

const TOPIC_OPTIONS = [
  "Music",
  "Gaming",
  "Art",
  "Sports",
  "Movies",
  "Books",
  "Tech",
  "Fashion",
  "Food",
  "Travel",
  "Photography",
  "Fitness",
  "Anime",
  "Memes",
  "Science",
  "Activism",
] as const;

function Auth() {
  const nav = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<"form" | "confirm" | "topics">("form");
  const [pendingSignup, setPendingSignup] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [guides, setGuides] = useState<
    Array<{
      topic: string;
      intro: string;
      groups: { name: string; vibe: string }[];
      people: { name: string; why: string }[];
      history: string;
      facts: string[];
    }>
  >([]);
  const [exploring, setExploring] = useState(false);
  const explore = useServerFn(exploreTopics);

  useEffect(() => {
    if (loading) return;
    if (!session) return;
    // Just signed up (with or without email confirm) → advance into topics.
    if (pendingSignup) {
      setPendingSignup(false);
      setStep("topics");
      return;
    }
    // Returning signed-in user landing on /auth → send them home.
    if (step === "form" && mode === "signin") {
      nav({ to: "/home", replace: true });
    }
  }, [loading, session, nav, step, mode, pendingSignup]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const ageNum = Number(age);
        if (!Number.isFinite(ageNum) || ageNum < 14) {
          toast.error("Links is for ages 14 and up.");
          return;
        }
        if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
          toast.error("Username: 3–24 letters, numbers, or underscores.");
          return;
        }
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: { username, full_name: username },
          },
        });
        if (error) throw error;
        // Two possible outcomes:
        // 1) Auto-confirm on → signUp returns a session immediately.
        // 2) Email confirmation required → no session; user must click link in email.
        if (signUpData.session) {
          toast.success("Account created — now pick your vibe ✨");
          setPendingSignup(true); // effect will advance to topics once session lands
          setStep("topics");
        } else {
          setPendingSignup(true); // when they confirm & land back, effect advances
          setStep("confirm");
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Effect will redirect to /home once session propagates.
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function toggleTopic(t: string) {
    setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
    // invalidate guides when selection changes
    setGuides([]);
  }

  async function runExplore() {
    if (exploring || topics.length === 0) return;
    setExploring(true);
    try {
      const limited = topics.slice(0, 6);
      const res = await explore({ data: { topics: limited } });
      setGuides(res.topics || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not load topic info";
      toast.error(msg);
    } finally {
      setExploring(false);
    }
  }

  async function saveTopicsAndExplore() {
    if (busy) return;
    setBusy(true);
    try {
      const userId = session?.user.id;
      if (!userId) {
        toast.error("Session not ready yet — give it a sec and try again.");
        return;
      }
      if (topics.length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update({ topics })
          .eq("id", userId);
        if (error) throw error;
      }
      nav({ to: "/discover", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save topics";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function signInGoogle() {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/home`,
      });
      if (res.error) {
        toast.error(res.error.message || "Google sign-in failed");
      }
    } finally {
      setBusy(false);
    }
  }

  async function continueAsGuest() {
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      toast.success("You're in as a guest ✨");
      setPendingSignup(true); // effect will advance to topics once session lands
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start guest session";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/30 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-20 right-0 h-72 w-72 rounded-full bg-accent/30 blur-[100px]" />

      <div className="relative z-10 mx-auto flex max-w-md flex-col px-6 py-10">
        <Link to="/" className="mb-10 text-2xl font-black">
          <span className="bg-gradient-to-r from-primary-glow to-accent bg-clip-text text-transparent">Links</span>
        </Link>

        <div
          className="rounded-3xl border border-border p-6 backdrop-blur"
          style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}
        >
          {step === "confirm" ? (
            <div>
              <h1 className="text-2xl font-black">Confirm your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>.
                Open it on this device to finish creating your Links account — we'll take it from there.
              </p>
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-background/40 p-3 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for confirmation…
              </div>
              <button
                type="button"
                onClick={() => {
                  setPendingSignup(false);
                  setStep("form");
                  setMode("signin");
                }}
                className="mt-4 w-full rounded-full px-6 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Already confirmed? Sign in
              </button>
            </div>
          ) : step === "topics" ? (
            <div>
              <h1 className="text-2xl font-black">Pick your vibe</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose topics you love — we'll tune your feed and people you meet.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {TOPIC_OPTIONS.map((t) => {
                  const active = topics.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleTopic(t)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                        active
                          ? "border-transparent text-primary-foreground"
                          : "border-border bg-background/40 text-foreground hover:bg-background/70"
                      }`}
                      style={active ? { background: "var(--gradient-primary)" } : undefined}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      {t}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {topics.length === 0 ? "Pick at least one to personalize Links." : `${topics.length} selected`}
              </p>
              <button
                type="button"
                onClick={runExplore}
                disabled={exploring || topics.length === 0}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background/40 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-background/70 disabled:opacity-50"
              >
                {exploring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {exploring ? "Link OS is gathering the good stuff…" : guides.length ? "Refresh insights" : "Show me what's inside"}
              </button>

              {guides.length > 0 && (
                <div className="mt-5 space-y-4">
                  {guides.map((g) => (
                    <article
                      key={g.topic}
                      className="rounded-2xl border border-border bg-background/40 p-4"
                    >
                      <header className="flex items-center gap-2">
                        <span
                          className="rounded-full px-3 py-0.5 text-xs font-bold text-primary-foreground"
                          style={{ background: "var(--gradient-primary)" }}
                        >
                          {g.topic}
                        </span>
                      </header>
                      <p className="mt-2 text-sm text-foreground">{g.intro}</p>

                      {g.groups?.length > 0 && (
                        <section className="mt-3">
                          <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <Users className="h-3 w-3" /> Groups to try
                          </h3>
                          <ul className="mt-1 space-y-1 text-xs">
                            {g.groups.map((x, i) => (
                              <li key={i}>
                                <span className="font-semibold text-foreground">{x.name}</span>
                                <span className="text-muted-foreground"> — {x.vibe}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {g.people?.length > 0 && (
                        <section className="mt-3">
                          <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <Star className="h-3 w-3" /> People to know
                          </h3>
                          <ul className="mt-1 space-y-1 text-xs">
                            {g.people.map((x, i) => (
                              <li key={i}>
                                <span className="font-semibold text-foreground">{x.name}</span>
                                <span className="text-muted-foreground"> — {x.why}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {g.history && (
                        <section className="mt-3">
                          <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <BookOpen className="h-3 w-3" /> History
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">{g.history}</p>
                        </section>
                      )}

                      {g.facts?.length > 0 && (
                        <section className="mt-3">
                          <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <Lightbulb className="h-3 w-3" /> Did you know
                          </h3>
                          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                            {g.facts.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </article>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={saveTopicsAndExplore}
                disabled={busy || topics.length === 0}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] disabled:opacity-60"
                style={{ background: "var(--gradient-primary)" }}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                  Start exploring
                  <ArrowRight className="h-4 w-4" />
                </>}
              </button>
              <button
                type="button"
                onClick={() => nav({ to: "/discover", replace: true })}
                disabled={busy}
                className="mt-2 w-full rounded-full px-6 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </button>
            </div>
          ) : (
          <>
          <div className="mb-6 flex rounded-full border border-border bg-background/40 p-1 text-sm" role="tablist" aria-label="Authentication mode">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-full py-2 font-semibold transition-colors ${
                  mode === m ? "text-primary-foreground" : "text-muted-foreground"
                }`}
                style={mode === m ? { background: "var(--gradient-primary)" } : undefined}
              >
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-black">
            {mode === "signup" ? "Welcome to Links" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Made for ages 14 and up." : "Pick up where you left off."}
          </p>

          <button
            type="button"
            onClick={signInGoogle}
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background"
          >
            <GoogleMark />
            Continue with Google
          </button>

          {mode === "signup" && (
            <button
              type="button"
              onClick={continueAsGuest}
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-background/40 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background/70 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ghost className="h-4 w-4" />}
              Continue as guest — no signup
            </button>
          )}

          <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            {mode === "signup" && (
              <>
                <Field label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" required />
                <Field label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="14+" required min={14} />
              </>
            )}
            <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
            <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                {mode === "signup" ? "Create account" : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </>}
            </button>
          </form>
          </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By joining you agree to keep Links kind. United we stand.
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        {...props}
        className="mt-1 w-full rounded-2xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
      />
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.3-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.6 8.8 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.9 13.2-5l-6.1-5c-2 1.4-4.4 2.3-7.1 2.3-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.1 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.1 5c-.4.4 6.7-4.9 6.7-14.7 0-1.2-.1-2.3-.3-3.5z"/>
    </svg>
  );
}
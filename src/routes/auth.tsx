import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Join Links" }] }),
  component: Auth,
});

function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [step, setStep] = useState<1 | 2>(1);
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
          <div className="mb-6 flex rounded-full border border-border bg-background/40 p-1 text-sm">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setStep(1); }}
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
            {mode === "signup"
              ? step === 1
                ? "Welcome to Links"
                : "Where are you based?"
              : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? step === 1
                ? "Made for ages 14 and up."
                : "We'll help you find people and events near you."
              : "Pick up where you left off."}
          </p>

          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (mode === "signup" && step === 1) setStep(2);
              else nav({ to: "/home" });
            }}
          >
            {mode === "signup" && step === 1 && (
              <>
                <Field label="Username" placeholder="@yourname" />
                <Field label="Email" placeholder="you@email.com" type="email" />
                <Field label="Password" placeholder="••••••••" type="password" />
                <Field label="Age" placeholder="14+" type="number" />
              </>
            )}
            {mode === "signup" && step === 2 && (
              <>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Country
                </label>
                <select className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary">
                  {["Mexico", "India", "United Kingdom", "Portugal", "Ghana", "United States", "Japan"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Language
                </label>
                <select className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary">
                  {["English", "Español", "Português", "Français", "हिन्दी", "日本語"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </>
            )}
            {mode === "signin" && (
              <>
                <Field label="Email" placeholder="you@email.com" type="email" />
                <Field label="Password" placeholder="••••••••" type="password" />
              </>
            )}

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-primary)" }}
            >
              {mode === "signup" && step === 1 ? "Continue" : "Enter Links"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
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
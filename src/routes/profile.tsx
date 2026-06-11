import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { Settings, Globe, Languages, LogOut } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "You — Links" }] }),
  component: Profile,
});

function Profile() {
  return (
    <AppShell title="You">
      <div
        className="rounded-3xl border border-border p-6 text-center"
        style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}
      >
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          A
        </div>
        <h2 className="mt-4 text-xl font-bold">Alex Rivera</h2>
        <p className="text-sm text-muted-foreground">@alex · 🇲🇽 Mexico</p>
        <p className="mt-3 text-sm">Curious mind. Here for science, music, and the people in between.</p>
      </div>

      <div className="mt-6 space-y-2">
        {[
          { icon: Globe, label: "Country", value: "Mexico" },
          { icon: Languages, label: "Language", value: "English" },
          { icon: Settings, label: "Settings", value: "" },
        ].map(({ icon: Icon, label, value }) => (
          <button
            key={label}
            className="press flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
          >
            <Icon className="h-4 w-4 text-primary-glow" />
            <span className="flex-1 text-sm font-semibold">{label}</span>
            <span className="text-xs text-muted-foreground">{value}</span>
          </button>
        ))}
        <Link
          to="/"
          className="press flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left text-destructive transition-colors hover:border-destructive/40"
        >
          <LogOut className="h-4 w-4" />
          <span className="flex-1 text-sm font-semibold">Sign out</span>
        </Link>
      </div>
    </AppShell>
  );
}
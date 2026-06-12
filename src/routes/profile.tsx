import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { Settings, Globe, Languages, LogOut } from "lucide-react";
import { useKeyboardAction } from "@/hooks/use-keyboard-action";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "You — Links" }] }),
  component: Profile,
});

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  const handleClick = () => {};
  const onKeyDown = useKeyboardAction(handleClick);
  return (
    <button
      onClick={handleClick}
      onKeyDown={onKeyDown}
      className="press flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
    >
      <Icon className="h-4 w-4 text-primary-glow" aria-hidden="true" />
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{value}</span>
    </button>
  );
}

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
          aria-hidden="true"
        >
          A
        </div>
        <h2 className="mt-4 text-xl font-bold">Alex Rivera</h2>
        <p className="text-sm text-muted-foreground">@alex · 🇲🇽 Mexico</p>
        <p className="mt-3 text-sm">Curious mind. Here for science, music, and the people in between.</p>
      </div>

      <div className="mt-6 space-y-2">
        <ProfileRow icon={Globe} label="Country" value="Mexico" />
        <ProfileRow icon={Languages} label="Language" value="English" />
        <ProfileRow icon={Settings} label="Settings" value="" />
        <Link
          to="/"
          className="press flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left text-destructive transition-colors hover:border-destructive/40 focus-visible:rounded-2xl"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="flex-1 text-sm font-semibold">Sign out</span>
        </Link>
      </div>
    </AppShell>
  );
}

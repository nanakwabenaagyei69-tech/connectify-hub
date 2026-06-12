import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppNav";
import { MapPin, Calendar } from "lucide-react";
import { useKeyboardAction } from "@/hooks/use-keyboard-action";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — Links" }] }),
  component: Events,
});

const events = [
  { name: "Global Climate March", city: "Worldwide", date: "Sep 21", going: 18420 },
  { name: "World Music Day", city: "Paris, France", date: "Jun 21", going: 5210 },
  { name: "Hack the Planet Jam", city: "Online", date: "Aug 03", going: 942 },
  { name: "Diwali Lights Meetup", city: "Mumbai, India", date: "Oct 29", going: 12030 },
];

function EventCard({ e }: { e: typeof events[number] }) {
  const handleCard = () => {};
  const onCardKeyDown = useKeyboardAction(handleCard);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCard}
      onKeyDown={onCardKeyDown}
      className="press rounded-2xl border border-border bg-card p-4 cursor-pointer transition-colors hover:border-primary/40"
      aria-label={`Event ${e.name} in ${e.city} on ${e.date}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">{e.name}</h3>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" /> {e.city}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" aria-hidden="true" /> {e.date}</span>
          </div>
          <div className="mt-2 text-xs text-primary-glow">{e.going.toLocaleString()} going</div>
        </div>
        <button
          className="press press-glow rounded-full px-4 py-2 text-xs font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
          aria-label={`Sign up for ${e.name}`}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}

function Events() {
  return (
    <AppShell title="Global Events">
      <div
        className="relative mb-6 h-44 overflow-hidden rounded-3xl border border-border"
        style={{ background: "var(--gradient-card)" }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 40%, oklch(0.6 0.25 300 / 0.5), transparent 40%), radial-gradient(circle at 70% 60%, oklch(0.65 0.22 310 / 0.5), transparent 40%), radial-gradient(circle at 50% 30%, oklch(0.55 0.24 290 / 0.4), transparent 40%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full border border-border bg-background/60 px-4 py-2 text-xs backdrop-blur">
            🌍 Live map · 47 events near you
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((e) => (
          <EventCard key={e.name} e={e} />
        ))}
      </div>
    </AppShell>
  );
}

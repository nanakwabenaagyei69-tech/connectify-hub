import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Users, Globe2, Sparkles } from "lucide-react";
import { useKeyboardAction } from "@/hooks/use-keyboard-action";
import { LinksLogo } from "@/components/LinksLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Links — United we stand" },
      { name: "description", content: "Connect with people and groups near you. Share ideas. Show up for global events." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: MessageCircle, title: "Real conversations", body: "Threaded chats and comment sections that don't feel like noise." },
  { icon: Users, title: "Groups that matter", body: "Spin up a group for a class project, a hobby, or a cause in seconds." },
  { icon: Globe2, title: "Global events", body: "RSVP to celebrations and meetups around the world — see them on a map." },
];

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  const handleCard = () => {};
  const onCardKeyDown = useKeyboardAction(handleCard);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCard}
      onKeyDown={onCardKeyDown}
      className="rounded-3xl border border-border p-6 backdrop-blur transition-transform hover:-translate-y-1 cursor-pointer"
      style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}
      aria-label={`Feature: ${title}`}
    >
      <div
        className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Landing() {
  return LandingInner();
}

function LogoShowcase() {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
      {/* Ambient gradient halo */}
      <div
        className="absolute inset-6 rounded-[42%] blur-3xl opacity-70"
        style={{ background: "var(--gradient-primary)" }}
        aria-hidden="true"
      />

      {/* Concentric rotating rings */}
      <div
        className="absolute inset-0 rounded-full border border-primary/25 [mask-image:radial-gradient(circle,black_60%,transparent_75%)] animate-[spin_28s_linear_infinite]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-6 rounded-full border border-accent/40 [mask-image:radial-gradient(circle,black_55%,transparent_80%)] animate-[spin_44s_linear_infinite_reverse]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-12 rounded-full border border-dashed border-primary-glow/50"
        aria-hidden="true"
      />

      {/* Orbiting satellite chips */}
      {[
        { label: "chat", top: "6%", left: "50%" },
        { label: "groups", top: "50%", left: "94%" },
        { label: "events", top: "94%", left: "50%" },
        { label: "topics", top: "50%", left: "6%" },
      ].map((chip) => (
        <span
          key={chip.label}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-card/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground shadow-[var(--shadow-card)] backdrop-blur"
          style={{ top: chip.top, left: chip.left }}
        >
          {chip.label}
        </span>
      ))}

      {/* Central logo tile */}
      <div
        className="relative flex aspect-square w-[62%] items-center justify-center rounded-[32%] p-8"
        style={{
          background: "var(--gradient-card)",
          boxShadow: "var(--shadow-glow), var(--shadow-card)",
          border: "1px solid color-mix(in oklab, var(--primary) 25%, transparent)",
        }}
      >
        <LinksLogo
          variant="mark"
          className="h-full w-full"
          colorClassName="text-primary"
          alt="Links emblem"
        />
      </div>

      {/* Motto ribbon */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background/80 px-4 py-1.5 text-[11px] font-semibold tracking-widest text-primary-glow shadow-[var(--shadow-card)] backdrop-blur">
        UNITED · WE · STAND
      </div>
    </div>
  );
}

function LandingInner() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 rounded-full bg-accent/30 blur-[120px]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2 focus-visible:rounded-lg" aria-label="Links home">
          <LinksLogo className="h-10 w-auto" colorClassName="text-primary" alt="Links — United we stand" />
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/auth" className="rounded-full px-4 py-2 text-sm text-foreground/80 hover:text-foreground focus-visible:rounded-full">
            Sign in
          </Link>
          <Link
            to="/auth"
            className="press press-glow rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105 focus-visible:rounded-full"
            style={{ background: "var(--gradient-primary)" }}
          >
            Join Links
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pt-12 pb-24 md:grid-cols-2 md:pt-20">
        {/* Left: copy */}
        <div className="text-center md:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary-glow" aria-hidden="true" />
            For everyone 14 and up
          </div>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
            United we
            <br />
            <span className="text-foreground">stand.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:mx-0 mx-auto">
            Find your people, your topics, your moments. Links blends group chat, communities, and global events into one place to actually connect.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link
              to="/home"
              className="press press-glow group inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105 focus-visible:rounded-full"
              style={{ background: "var(--gradient-primary)" }}
            >
              Enter the app
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/discover"
              className="press rounded-full border border-border bg-card/40 px-6 py-3 font-semibold text-foreground backdrop-blur hover:bg-card focus-visible:rounded-full"
            >
              Explore topics
            </Link>
          </div>
        </div>

        {/* Right: logo showcase */}
        <LogoShowcase />
      </section>

      <section className="relative z-10 mx-auto grid max-w-5xl gap-4 px-6 pb-24 md:grid-cols-3">
        {features.map(({ icon, title, body }) => (
          <FeatureCard key={title} icon={icon} title={title} body={body} />
        ))}
      </section>

      <footer className="relative z-10 border-t border-border py-8 text-center text-xs text-muted-foreground">
        Links · United we stand · Built with care for ages 14+
      </footer>
    </div>
  );
}

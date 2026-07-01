import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Compass, MessageCircle, Calendar, User } from "lucide-react";
import { useSwipeNavigation, hapticTap } from "@/hooks/use-swipe-nav";
import { useCallback, useEffect, useRef } from "react";
import { LinksOS } from "@/components/LinksOS";
import { useAuth } from "@/hooks/use-auth";
import { LinksLogo } from "@/components/LinksLogo";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/chats", label: "Chats", icon: MessageCircle },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/profile", label: "You", icon: User },
] as const;

export function AppNav() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const currentIdx = items.findIndex((i) => i.to === path);

  const onTabKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      let nextIdx = -1;
      if (e.key === "ArrowRight") {
        nextIdx = (idx + 1) % items.length;
      } else if (e.key === "ArrowLeft") {
        nextIdx = (idx - 1 + items.length) % items.length;
      } else if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = items.length - 1;
      }
      if (nextIdx !== -1) {
        e.preventDefault();
        const next = items[nextIdx];
        navigate({ to: next.to });
        // Focus the next tab after navigation
        setTimeout(() => tabRefs.current[nextIdx]?.focus(), 0);
      }
    },
    [navigate]
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, label, icon: Icon }, idx) => {
          const isActive = currentIdx === idx;
          return (
            <Link
              key={to}
              to={to}
              ref={(el) => { tabRefs.current[idx] = el; }}
              onClick={hapticTap}
              onKeyDown={(e) => onTabKeyDown(e, idx)}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className="press press-sm group flex min-w-[56px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-xl"
              activeProps={{ className: "text-primary-glow" }}
            >
              <Icon className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  useSwipeNavigation();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);
  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background pb-20">
      {title && (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center focus-visible:rounded-lg" aria-label="Links home">
              <LinksLogo className="h-8 w-auto" colorClassName="text-primary" alt="Links" />
            </Link>
            <h1 className="text-sm font-semibold text-muted-foreground">{title}</h1>
          </div>
        </header>
      )}
      <main key={title} className="route-enter mx-auto max-w-2xl px-4 py-6">
        {children}
      </main>
      <AppNav />
      <LinksOS />
    </div>
  );
}

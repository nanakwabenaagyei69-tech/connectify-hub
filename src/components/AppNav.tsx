import { Link } from "@tanstack/react-router";
import { Home, Compass, MessageCircle, Calendar, User } from "lucide-react";
import { useSwipeNavigation, hapticTap } from "@/hooks/use-swipe-nav";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/chats", label: "Chats", icon: MessageCircle },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/profile", label: "You", icon: User },
] as const;

export function AppNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={hapticTap}
            className="press press-sm group flex min-w-[56px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-primary-glow" }}
          >
            <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  useSwipeNavigation();
  return (
    <div className="min-h-screen bg-background pb-20">
      {title && (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <Link to="/" className="text-lg font-black tracking-tight">
              <span className="bg-gradient-to-r from-primary-glow to-accent bg-clip-text text-transparent">Links</span>
            </Link>
            <h1 className="text-sm font-semibold text-muted-foreground">{title}</h1>
          </div>
        </header>
      )}
      <main key={title} className="route-enter mx-auto max-w-2xl px-4 py-6">
        {children}
      </main>
      <AppNav />
    </div>
  );
}
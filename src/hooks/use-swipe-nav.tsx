import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const NAV_ORDER = ["/home", "/discover", "/chats", "/events", "/profile"] as const;
type NavPath = (typeof NAV_ORDER)[number];

function vibrate(ms: number) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* noop */
    }
  }
}

/**
 * Horizontal swipe navigation across the bottom-tab order.
 * Vertical scrolls are ignored. Threshold = 60px, max off-axis 50px.
 */
export function useSwipeNavigation() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    const idx = NAV_ORDER.indexOf(path as NavPath);
    if (idx === -1) return;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    };
    const onEnd = (e: TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      const dt = Date.now() - s.t;
      if (Math.abs(dx) < 60 || Math.abs(dy) > 50 || dt > 600) return;
      const dir = dx < 0 ? 1 : -1;
      const next = NAV_ORDER[idx + dir];
      if (next) {
        vibrate(8);
        navigate({ to: next });
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [path, navigate]);
}

export function hapticTap() {
  vibrate(6);
}
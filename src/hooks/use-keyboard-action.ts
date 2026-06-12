import { useCallback } from "react";

/**
 * Returns a keyboard handler that invokes `onAction` when Enter or Space is pressed.
 * Use on elements that are not native buttons but act as buttons (cards, tabs, etc.).
 */
export function useKeyboardAction(onAction: () => void) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onAction();
      }
    },
    [onAction]
  );
}

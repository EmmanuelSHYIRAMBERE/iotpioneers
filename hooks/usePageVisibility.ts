"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  document.addEventListener("visibilitychange", callback);
  return () => {
    document.removeEventListener("visibilitychange", callback);
  };
}

/** False while the tab is hidden, so loops can pause. */
export function usePageVisibility(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.visibilityState === "visible",
    () => true,
  );
}

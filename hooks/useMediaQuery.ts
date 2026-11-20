"use client";

import { useCallback, useSyncExternalStore } from "react";

export const mediaQueries = {
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

/** Subscribe to a media query. Returns `serverValue` during server rendering and hydration. */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => {
        media.removeEventListener("change", callback);
      };
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

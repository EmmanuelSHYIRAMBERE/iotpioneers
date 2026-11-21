"use client";

import { useSyncExternalStore } from "react";
import { REDUCE_MOTION_STORAGE_KEY } from "@/lib/motion";

/**
 * Reduced motion = the system preference OR the footer "Reduce motion" toggle.
 * The manual choice lives in localStorage and on <html data-reduce-motion>, so CSS driven
 * motion (pulses, shimmer) responds too. An inline script in app/layout.tsx sets
 * the attribute before first paint to avoid a flash of motion.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

const listeners = new Set<() => void>();

function readManual(): boolean {
  try {
    return window.localStorage.getItem(REDUCE_MOTION_STORAGE_KEY) === "true";
  } catch {
    return document.documentElement.dataset.reduceMotion === "true";
  }
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches || readManual();
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => {
    listeners.delete(callback);
    media.removeEventListener("change", callback);
  };
}

/** True when the visitor prefers reduced motion (system setting or footer toggle). */
export function useReducedMotionPreference(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The manual toggle state only (for the footer switch). */
export function useManualReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    readManual,
    () => false,
  );
}

export function setManualReducedMotion(value: boolean): void {
  try {
    window.localStorage.setItem(REDUCE_MOTION_STORAGE_KEY, String(value));
  } catch {
    // Storage can be unavailable (private mode); the attribute below still applies for this visit.
  }
  document.documentElement.dataset.reduceMotion = String(value);
  listeners.forEach((listener) => {
    listener();
  });
}

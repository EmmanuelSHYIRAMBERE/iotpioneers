"use client";

import { useEffect, useState, type RefObject } from "react";

export interface UseInViewOptions {
  /** Fraction of the element that must be visible. */
  amount?: number;
  rootMargin?: string;
  /** Stop observing after the first time the element is in view. */
  once?: boolean;
}

/** Track whether an element is in the viewport. Used to start and stop every continuous loop. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { amount = 0, rootMargin = "0px", once = false }: UseInViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Every supported browser has IntersectionObserver; without it loops simply stay paused.
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
          if (entry.isIntersecting && once) observer.disconnect();
        }
      },
      { threshold: amount, rootMargin },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref, amount, rootMargin, once]);

  return inView;
}

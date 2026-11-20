"use client";

import { useEffect, useState } from "react";

/**
 * Report which section currently crosses 40% of the viewport height. The root margin
 * shrinks the observed band to a thin line at that height.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key.split("|");
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -59% 0px", threshold: 0 },
    );
    elements.forEach((element) => {
      observer.observe(element);
    });

    const onScroll = (): void => {
      // Above the first tracked section (the hero) nothing is active.
      const first = elements[0];
      if (first && first.getBoundingClientRect().top > window.innerHeight * 0.4) setActive(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  return active;
}

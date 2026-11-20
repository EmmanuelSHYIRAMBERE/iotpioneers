"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

export interface MountWhenNearProps {
  children: ReactNode;
  /** Rendered until the area is within one viewport (and without JavaScript). */
  fallback?: ReactNode;
  className?: string;
}

/** Defers mounting heavy client pieces until they are about one viewport away. */
export function MountWhenNear({ children, fallback = null, className }: MountWhenNearProps) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { rootMargin: "100% 0px", once: true });
  return (
    <div ref={ref} className={cn(className)}>
      {near ? children : fallback}
    </div>
  );
}

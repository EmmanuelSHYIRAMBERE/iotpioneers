"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { ease, runDistance, runTiming, s, timing } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";

export interface CopyToClipboardProps {
  value: string;
  /** What is being copied, for the accessible label, for example "email address". */
  label: string;
  className?: string;
}

type CopyStatus = "idle" | "copied" | "failed";

/** Copies a value and announces the result politely. "Copied" shows for 1.6 seconds. */
export function CopyToClipboard({ value, label, className }: CopyToClipboardProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = async (): Promise<void> => {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    timer.current = window.setTimeout(() => {
      setStatus("idle");
    }, timing.copied);
  };

  return (
    <span className={cn("inline-flex items-center", className)}>
      <button
        type="button"
        onClick={() => {
          void copy();
        }}
        aria-label={`Copy ${label}`}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-button px-2 text-slate-400 transition-colors duration-200 hover:bg-navy-800 hover:text-cloud-50"
      >
        {status === "copied" ? (
          // Check pops in over 200ms (MotionConfig turns it off with reduced motion).
          <motion.span
            initial={{ scale: runDistance.copyPopFrom }}
            animate={{ scale: 1 }}
            transition={{ duration: s(runTiming.copyPop), ease: ease.outExpo }}
            className="inline-flex"
          >
            <Check
              aria-hidden="true"
              size={16}
              strokeWidth={ICON_STROKE}
              className="text-green-400"
            />
          </motion.span>
        ) : (
          <Copy aria-hidden="true" size={16} strokeWidth={ICON_STROKE} />
        )}
        <span
          aria-hidden="true"
          className={cn("font-mono text-small", status === "idle" && "sr-only")}
        >
          {status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : ""}
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied"
          ? `${label} copied`
          : status === "failed"
            ? "Copy failed, select the text instead"
            : ""}
      </span>
    </span>
  );
}

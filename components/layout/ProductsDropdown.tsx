"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, LayoutDashboard, ShoppingBag } from "lucide-react";
import type { ProductEntry } from "@/content/types";
import { cn } from "@/lib/cn";
import { distance, ease, s, timing } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";

export interface ProductsDropdownProps {
  label: string;
  products: readonly ProductEntry[];
  active: boolean;
}

/**
 * Disclosure navigation (WAI-ARIA disclosure pattern for site menus). Opens on click, Enter,
 * Space or Arrow Down; closes on Escape (focus returns to the trigger), outside click and when
 * focus leaves the panel. Each item scrolls to its section; a separate link opens the live site.
 */
export function ProductsDropdown({ label, products, active }: ProductsDropdownProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent): void => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const focusFirst = (): void => {
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            focusFirst();
          }
        }}
        className={cn(
          "inline-flex min-h-11 items-center gap-1 text-[0.9375rem] font-medium transition-colors duration-200",
          active || open ? "text-navy-950" : "text-navy-950/70 hover:text-navy-950",
        )}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          size={16}
          strokeWidth={ICON_STROKE}
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            id={panelId}
            initial={{ opacity: 0, x: "-50%", y: -distance.small }}
            animate={{ opacity: 1, x: "-50%", y: 0 }}
            exit={{
              opacity: 0,
              x: "-50%",
              y: -distance.small,
              transition: { duration: s(timing.illustrationOut), ease: ease.in },
            }}
            transition={{ duration: s(timing.solutionPanel), ease: ease.outExpo }}
            className="absolute top-full left-1/2 mt-3 w-[320px] rounded-card border border-slate-200 bg-white p-2 shadow-hover"
          >
            <ul className="flex flex-col gap-1">
              {products.map((product) => {
                const Icon = product.id === "iotdatahub" ? LayoutDashboard : ShoppingBag;
                return (
                  <li
                    key={product.id}
                    className="flex items-stretch gap-1 rounded-button transition-colors duration-200 hover:bg-slate-50"
                  >
                    <a
                      href={product.sectionHref}
                      onClick={() => {
                        setOpen(false);
                      }}
                      className="flex min-w-0 flex-1 items-start gap-3 rounded-button p-3"
                    >
                      <Icon
                        aria-hidden="true"
                        size={24}
                        strokeWidth={ICON_STROKE}
                        className="shrink-0 text-bright-gold"
                      />
                      <span className="min-w-0">
                        <span className="block font-display text-[0.9375rem] font-semibold text-navy-950">
                          {product.name}
                        </span>
                        <span className="block text-small text-slate-600">
                          {product.description}
                        </span>
                      </span>
                    </a>
                    <a
                      href={product.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open the ${product.name} website (opens in a new tab)`}
                      className="flex w-11 shrink-0 items-center justify-center rounded-button text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-navy-950"
                    >
                      <ArrowUpRight aria-hidden="true" size={18} strokeWidth={ICON_STROKE} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

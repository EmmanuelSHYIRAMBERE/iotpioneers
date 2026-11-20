"use client";

import { useEffect, useRef, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import type { NavItem, ProductEntry } from "@/content/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ease, runDistance, s, timing } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";

export interface MobileNavigationProps {
  open: boolean;
  onClose: (returnFocus: boolean) => void;
  /** The menu button: part of the focus trap and where focus returns on close. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  links: readonly NavItem[];
  products: readonly ProductEntry[];
  cta: { label: string; href: string };
  email: string;
  phone: string;
  phoneDisplay: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full screen menu dialog: focus trap (dialog plus the menu button), Escape closes, body scroll
 * locked, focus returns to the menu button. Panel slides down over 420ms; links stagger in.
 */
export function MobileNavigation({
  open,
  onClose,
  triggerRef,
  links,
  products,
  cta,
  email,
  phone,
  phoneDisplay,
}: MobileNavigationProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const main = document.getElementById("main-content");
    const footer = document.querySelector("footer");
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose(true);
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      const trigger = triggerRef.current;
      if (!panel || !trigger) return;
      const items = [trigger, ...Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, triggerRef]);

  const item = (index: number) => ({
    initial: { opacity: 0, x: runDistance.enter },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: s(timing.menuLinkIn),
        ease: ease.outExpo,
        delay: s(timing.menuStagger * (index + 2)),
      },
    },
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={{ y: "-100%" }}
          animate={{ y: 0, transition: { duration: s(timing.menuOpen), ease: ease.outExpo } }}
          exit={{ y: "-100%", transition: { duration: s(timing.menuClose), ease: ease.in } }}
          className="surface-dark fixed inset-0 z-40 flex flex-col overflow-y-auto bg-navy-950 px-5 pt-24 pb-8 sm:px-6 md:px-10"
        >
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {links.map((link, index) => (
                <motion.li key={link.href} {...item(index)} className="border-b border-line-dark">
                  <a
                    href={link.href}
                    onClick={() => {
                      onClose(false);
                    }}
                    className="block py-4 font-display text-menu font-semibold text-cloud-50"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.ul {...item(links.length)} className="mt-6 grid gap-3 sm:grid-cols-2">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex items-stretch rounded-card border border-line-dark"
                >
                  <a
                    href={product.sectionHref}
                    onClick={() => {
                      onClose(false);
                    }}
                    className="min-w-0 flex-1 p-4"
                  >
                    <span className="block font-display text-h4 text-cloud-50">{product.name}</span>
                    <span className="mt-1 block text-small text-slate-400">
                      {product.description}
                    </span>
                  </a>
                  <a
                    href={product.externalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open the ${product.name} website (opens in a new tab)`}
                    className="flex w-12 shrink-0 items-center justify-center border-l border-line-dark text-slate-400"
                  >
                    <ArrowUpRight aria-hidden="true" size={20} strokeWidth={ICON_STROKE} />
                  </a>
                </li>
              ))}
            </motion.ul>
          </nav>
          <motion.div {...item(links.length + 1)} className="mt-auto flex flex-col gap-4 pt-10">
            <AnimatedButton
              href={cta.href}
              size="lg"
              className="w-full"
              onClick={() => {
                onClose(false);
              }}
            >
              {cta.label}
            </AnimatedButton>
            <div className="flex flex-col gap-1 font-mono text-small">
              <a
                href={`mailto:${email}`}
                className="inline-flex min-h-11 items-center gap-2 text-bright-gold"
              >
                <Mail aria-hidden="true" size={16} strokeWidth={ICON_STROKE} />
                {email}
              </a>
              <a
                href={`tel:${phone}`}
                className="inline-flex min-h-11 items-center gap-2 text-bright-gold"
              >
                <Phone aria-hidden="true" size={16} strokeWidth={ICON_STROKE} />
                {phoneDisplay}
              </a>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

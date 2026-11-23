"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { NavItem, ProductEntry } from "@/content/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ScrollProgressIndicator } from "@/components/ui/ScrollProgressIndicator";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/cn";
import { ease, runDistance, runTiming, s, spring, staggerDelay } from "@/lib/motion";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import { Logo } from "./Logo";
import { MobileNavigation } from "./MobileNavigation";
import { ProductsDropdown } from "./ProductsDropdown";

export interface NavbarProps {
  brandName: string;
  links: readonly NavItem[];
  products: readonly ProductEntry[];
  cta: { label: string; href: string };
  email: string;
  phone: string;
  phoneDisplay: string;
}

const TRACKED_SECTIONS = ["about", "solutions", "iotdatahub", "shop", "why", "contact"] as const;
const SCROLL_THRESHOLD = 24;

/** Which nav link a section belongs to. */
function linkForSection(section: string | null): string | null {
  if (section === "iotdatahub" || section === "shop") return "#iotdatahub";
  if (section === "about" || section === "solutions" || section === "contact") return `#${section}`;
  return null;
}

/**
 * Sticky navigation. Transparent over the hero (80px), then a dark glass bar (64px) after 24px of
 * scroll. The height change is drawn with transforms: the bar slides up 16px and its content
 * recentres, so nothing animates height.
 */
export function Navbar({
  brandName,
  links,
  products,
  cta,
  email,
  phone,
  phoneDisplay,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const activeSection = useActiveSection(TRACKED_SECTIONS);
  const activeHref = linkForSection(activeSection);

  useEffect(() => {
    const onScroll = (): void => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Keep the hash in step with scrolling without adding history entries.
  useEffect(() => {
    const target = activeSection
      ? `#${activeSection}`
      : window.location.pathname + window.location.search;
    if (activeSection ? window.location.hash !== target : window.location.hash !== "") {
      window.history.replaceState(window.history.state, "", target);
    }
  }, [activeSection]);

  const closeMenu = useCallback((returnFocus: boolean) => {
    setMenuOpen(false);
    if (returnFocus) menuButtonRef.current?.focus();
  }, []);

  // Entrance (scroll-motion-choreography): links drop 8px with a 40ms stagger from 100ms. The
  // header is never hidden: nothing here starts at opacity 0, so the logo, links and CTA are
  // visible in the server HTML before JavaScript runs. Reduced motion renders everything in place.
  const reduced = useReducedMotionPreference();
  // Always keep an `animate` target: the server renders with motion allowed, and if the client then
  // reads reduced motion, an element with `initial` but no `animate` would stay in its start state.
  const enter = (index: number, drop: boolean) =>
    drop
      ? {
          initial: { y: -runDistance.navLinkDrop },
          animate: { y: 0 },
          transition: reduced
            ? { duration: 0 }
            : {
                duration: s(runTiming.navLogoFade),
                ease: ease.outExpo,
                delay: s(runTiming.navLinksAt) + staggerDelay(index, runTiming.navLinkStagger),
              },
        }
      : { initial: false as const };
  const ctaIndex = links.length + 1;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-20 transition-transform duration-[240ms] ease-standard",
          scrolled && !menuOpen ? "-translate-y-4" : "translate-y-0",
        )}
      >
        {/* Scrolled bar: navy at 0.92 opacity over every section, so it never turns grey over light sections (audit issue 5). */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 top-4 bottom-0 border-b border-slate-200 bg-white/95 backdrop-blur-[16px] transition-opacity duration-[240ms] ease-standard",
            scrolled && !menuOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "container-page relative flex h-full items-center justify-between gap-6 transition-transform duration-[240ms] ease-standard",
            scrolled && !menuOpen ? "translate-y-2" : "translate-y-0",
          )}
        >
          <a
            href="#top"
            className="inline-flex min-h-11 items-center rounded-button"
            aria-label={`${brandName}, back to top`}
          >
            <Logo alt="" size="nav" />
          </a>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {links.map((link, index) => {
                const active = activeHref === link.href;
                if (link.label === "Products") {
                  return (
                    <motion.li key={link.href} className="relative isolate" {...enter(index, true)}>
                      <ProductsDropdown label={link.label} products={products} active={active} />
                      {active ? <ActivePill /> : null}
                    </motion.li>
                  );
                }
                return (
                  <motion.li key={link.href} className="relative isolate" {...enter(index, true)}>
                    <a
                      href={link.href}
                      aria-current={active ? "location" : undefined}
                      className={cn(
                        "inline-flex min-h-11 items-center text-[0.9375rem] font-medium transition-colors duration-200",
                        active ? "text-navy-950" : "text-navy-950/70 hover:text-navy-950",
                      )}
                    >
                      {link.label}
                    </a>
                    {active ? <ActivePill /> : null}
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <motion.span className="hidden md:inline-flex" {...enter(ctaIndex, false)}>
              <AnimatedButton href={cta.href}>{cta.label}</AnimatedButton>
            </motion.span>
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => {
                setMenuOpen((value) => !value);
              }}
              className="relative flex size-11 items-center justify-center rounded-button text-navy-950 lg:hidden"
            >
              <span aria-hidden="true" className="relative block h-3 w-6">
                <span
                  className={cn(
                    "absolute left-0 block h-[1.5px] w-6 bg-current transition-transform duration-[240ms] ease-standard",
                    menuOpen ? "top-[5px] rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-[1.5px] w-6 bg-current transition-transform duration-[240ms] ease-standard",
                    menuOpen ? "top-[5px] -rotate-45" : "top-[10.5px]",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
        {!menuOpen ? <ScrollProgressIndicator /> : null}
      </header>

      <MobileNavigation
        open={menuOpen}
        onClose={closeMenu}
        triggerRef={menuButtonRef}
        links={links}
        products={products}
        cta={cta}
        email={email}
        phone={phone}
        phoneDisplay={phoneDisplay}
      />
    </>
  );
}

function ActivePill() {
  return (
    <motion.span
      layoutId="nav-active-pill"
      aria-hidden="true"
      // Gold pill behind the active link: brightGold hairline and a 10% fill, text stays cloud50.
      className="pointer-events-none absolute -inset-x-3 inset-y-1 -z-10 rounded-full border border-bright-gold/45 bg-bright-gold/10"
      transition={spring.snappy}
    />
  );
}

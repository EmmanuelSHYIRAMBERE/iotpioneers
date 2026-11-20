"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import type { AsyncState, ProductIllustrationKey, ProductImage, StockImage } from "@/content/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { mediaQueries, useMediaQuery } from "@/hooks/useMediaQuery";
import { assertNever } from "@/lib/assertNever";
import { cn } from "@/lib/cn";
import { ease, s, staggerDelay, timing } from "@/lib/motion";
import { ICON_STROKE } from "@/lib/tokens";
import { isPreviewMode } from "@/lib/verification";
import { CategoryTabs } from "./CategoryTabs";
import { ProductCard } from "./ProductCard";

export interface GalleryCategory {
  id: string;
  label: string;
}

export interface GalleryProduct {
  id: string;
  /** Full shop title (accessible name). */
  name: string;
  /** Short name shown on the card (audit issue 28). */
  displayName: string;
  /** Stand-in category photo, or null to keep the line drawing (audit issue 26). */
  categoryImage: StockImage | null;
  categoryId: string;
  image: ProductImage | null;
  illustration: ProductIllustrationKey;
  href: string;
  verified: boolean;
}

export interface GalleryLabels {
  all: string;
  emptyMessage: string;
  emptyAction: string;
  errorMessage: string;
  errorFallback: string;
  /** Visible label on stand-in category photos. */
  illustrative: string;
}

export interface ProductGalleryProps {
  categories: readonly GalleryCategory[];
  products: readonly GalleryProduct[];
  labels: GalleryLabels;
  shopHref: string;
}

type ForcedState = "loading" | "empty" | "error";
const DRAG_THRESHOLD = 6;
const CARD_STEP = 280 + 24;

/** Development and preview only: `?shopState=loading|empty|error` forces a state for testing. */
function readForcedState(): ForcedState | null {
  if (!isPreviewMode()) return null;
  const value = new URLSearchParams(window.location.search).get("shopState");
  return value === "loading" || value === "empty" || value === "error" ? value : null;
}

function subscribeNever(): () => void {
  return () => undefined;
}

/** Category tabs plus a native scroll snap carousel. No carousel library. */
export function ProductGallery({ categories, products, labels, shopHref }: ProductGalleryProps) {
  const idPrefix = useId().replace(/:/g, "");
  const panelId = `${idPrefix}-panel`;
  const [category, setCategory] = useState("all");
  const forcedFromUrl = useSyncExternalStore(subscribeNever, readForcedState, () => null);
  const [dismissed, setDismissed] = useState(false);
  const forced = dismissed ? null : forcedFromUrl;
  const trackRef = useRef<HTMLUListElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const finePointer = useMediaQuery(mediaQueries.finePointer);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const [dragging, setDragging] = useState(false);

  const tabs: GalleryCategory[] = [{ id: "all", label: labels.all }, ...categories];
  const labelFor = (id: string): string => categories.find((item) => item.id === id)?.label ?? "";
  const visible =
    category === "all" ? products : products.filter((product) => product.categoryId === category);

  const state: AsyncState<readonly GalleryProduct[]> =
    forced === "loading"
      ? { status: "loading" }
      : forced === "error"
        ? { status: "error", message: labels.errorMessage }
        : forced === "empty" || visible.length === 0
          ? { status: "empty" }
          : { status: "ready", data: visible };

  const updateScrollState = useCallback((): void => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const ratio = max > 0 ? track.scrollLeft / max : 1;
    if (progressRef.current)
      progressRef.current.style.transform = `scaleX(${Math.max(0.04, ratio).toFixed(3)})`;
    setEdges({ start: track.scrollLeft <= 2, end: track.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const frame = requestAnimationFrame(updateScrollState);
    track.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, state.status, category]);

  const changeCategory = (id: string): void => {
    setCategory(id);
    trackRef.current?.scrollTo({ left: 0 });
  };

  const scrollByCards = (direction: 1 | -1): void => {
    trackRef.current?.scrollBy({ left: direction * CARD_STEP, behavior: "smooth" });
  };

  // Mouse drag with a 6px threshold, so a click on a card still opens it.
  const onPointerDown = (event: ReactPointerEvent<HTMLUListElement>): void => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: track.scrollLeft,
    };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLUListElement>): void => {
    const state = drag.current;
    const track = trackRef.current;
    if (!state.active || !track) return;
    const dx = event.clientX - state.startX;
    if (!state.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      state.moved = true;
      setDragging(true);
    }
    if (state.moved) track.scrollLeft = state.startScroll - dx;
  };
  const endDrag = (): void => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
  };

  const retry = (): void => {
    setDismissed(true);
  };

  let body: ReactNode;
  switch (state.status) {
    case "loading":
      body = (
        <div className="container-page grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <LoadingSkeleton key={i} variant="productCard" label="Loading products" />
          ))}
        </div>
      );
      break;
    case "empty":
      body = (
        <div className="container-page">
          <EmptyState
            message={labels.emptyMessage}
            action={
              <AnimatedButton variant="link" tone="light" href={shopHref} external>
                {labels.emptyAction}
              </AnimatedButton>
            }
          />
        </div>
      );
      break;
    case "error":
      body = (
        <div className="container-page">
          <ErrorState
            message={state.message}
            retry={
              <AnimatedButton
                variant="secondary"
                tone="light"
                icon={RotateCcw}
                iconPosition="left"
                onClick={retry}
              >
                Try again
              </AnimatedButton>
            }
            fallback={
              <AnimatedButton variant="link" tone="light" href={shopHref} external>
                {labels.errorFallback}
              </AnimatedButton>
            }
          />
        </div>
      );
      break;
    case "ready":
      body = (
        <ul
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={(event) => {
            if (drag.current.moved) {
              event.preventDefault();
              event.stopPropagation();
              drag.current.moved = false;
            }
          }}
          className={cn(
            "no-scrollbar flex gap-6 overflow-x-auto overscroll-x-contain pt-2 pb-6",
            "[scroll-padding-inline-start:max(var(--page-pad),calc((100%-var(--container-page))/2))] [padding-inline-start:max(var(--page-pad),calc((100%-var(--container-page))/2))]",
            "pr-[var(--page-pad)]",
            dragging ? "cursor-grabbing snap-none select-none" : "snap-x snap-mandatory",
            finePointer && !dragging && "cursor-grab",
          )}
        >
          {state.data.map((product, index) => (
            <motion.li
              key={product.id}
              className="w-[72vw] shrink-0 snap-start sm:w-[280px]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: s(timing.shopIn),
                ease: ease.outExpo,
                delay: staggerDelay(index, timing.shopStagger),
              }}
            >
              <ProductCard
                name={product.name}
                displayName={product.displayName}
                categoryImage={product.categoryImage}
                illustrativeLabel={labels.illustrative}
                category={labelFor(product.categoryId)}
                image={product.image}
                illustration={product.illustration}
                href={product.href}
                verified={product.verified}
                position={index + 1}
                total={state.data.length}
              />
            </motion.li>
          ))}
        </ul>
      );
      break;
    default:
      body = assertNever(state);
  }

  return (
    <div>
      <div className="container-page">
        <CategoryTabs
          tabs={tabs}
          value={category}
          onChange={changeCategory}
          panelId={panelId}
          idPrefix={idPrefix}
        />
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-${category}`}
        className="mt-10"
      >
        <section
          id={`${panelId}-track`}
          aria-roledescription="carousel"
          aria-label="Highlighted products"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${category}-${state.status}`}
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                y: 8,
                transition: { duration: s(timing.shopOut), ease: ease.in },
              }}
            >
              {body}
            </motion.div>
          </AnimatePresence>
        </section>
        {state.status === "ready" ? (
          // Carousel row: progress bar plus the previous and next buttons (audit issue 25 moved
          // them here from the category row).
          <div className="container-page mt-2 flex items-center gap-4">
            <div
              aria-hidden="true"
              className="h-0.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200"
            >
              <div
                ref={progressRef}
                className="h-full w-full origin-left bg-navy-950"
                style={{ transform: "scaleX(0.04)" }}
              />
            </div>
            <div className={cn("hidden gap-2", finePointer && "md:flex")}>
              <button
                type="button"
                aria-label="Previous products"
                aria-controls={`${panelId}-track`}
                disabled={edges.start}
                onClick={() => {
                  scrollByCards(-1);
                }}
                className="flex size-11 items-center justify-center rounded-full border border-navy-950/20 text-navy-950 transition-colors duration-200 hover:border-deep-gold hover:text-deep-gold disabled:pointer-events-none disabled:opacity-40"
              >
                <ArrowLeft aria-hidden="true" size={18} strokeWidth={ICON_STROKE} />
              </button>
              <button
                type="button"
                aria-label="Next products"
                aria-controls={`${panelId}-track`}
                disabled={edges.end}
                onClick={() => {
                  scrollByCards(1);
                }}
                className="flex size-11 items-center justify-center rounded-full border border-navy-950/20 text-navy-950 transition-colors duration-200 hover:border-deep-gold hover:text-deep-gold disabled:pointer-events-none disabled:opacity-40"
              >
                <ArrowRight aria-hidden="true" size={18} strokeWidth={ICON_STROKE} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

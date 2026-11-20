# IoT PIONEERS Ltd Landing Page

The corporate landing page for IoT PIONEERS Ltd, Kigali, Rwanda. A single-page, frontend-only marketing site that presents the company's engineering work and its two products:

- **IoTDataHub**: https://www.iotdatahub.rw/
- **IoT Pioneers Shop**: https://iotpioneersshop.com/

The concept is **"Signal to Insight"**: a data signal starts as scattered nodes in the hero, gains structure in the solutions index, comes alive in the IoTDataHub dashboard demo, becomes physical components in the Shop and converges into one bright node in the closing call to action.

> **Status:** feature complete as a **preview**. Every fact is still marked unverified, so `npm run build` fails on purpose until the client confirms the content (see [Content verification](#content-verification)). Use `npm run build:preview` for client review.

## Stack

Next.js 16 (App Router, static), React 19, TypeScript 5.9 (strict), Tailwind CSS 4, Motion for React 12, GSAP 3 with ScrollTrigger (two scroll sequences only, loaded lazily), Lucide icons, zod (build-time content validation). Tests use Vitest with Testing Library, Playwright with axe, and Lighthouse CI.

There are no chart, carousel, smooth-scroll, 3D or UI-kit libraries. The particle network is Canvas 2D, the chart is hand-built SVG and the carousel uses native scroll snap.

## Getting started

Requirements: Node.js 20 or later, npm.

```
npm install
npm run dev
```

Open http://localhost:3000. The development server shows unverified content with amber dotted outlines and an "Unverified" tag. The preview banner (bottom right) can hide the markers.

## Scripts

| Script                  | What it does                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`           | Development server (unverified content allowed and marked).                                                                                        |
| `npm run build`         | Production build. `prebuild` runs the content gate first and **fails while anything is unverified**.                                               |
| `npm run build:preview` | Build for client review: lists unverified items, shows the preview banner and markers, sets noindex and disallows robots.                          |
| `npm run start`         | Serve the last build.                                                                                                                              |
| `npm run lint`          | ESLint: typed rules, no `any`, layer boundaries, import cycles.                                                                                    |
| `npm run typecheck`     | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).                                                                 |
| `npm run test`          | Vitest unit and component tests.                                                                                                                   |
| `npm run test:e2e`      | Playwright (Chromium, Firefox, WebKit, Pixel 7, iPhone 14) with axe. Builds a preview build on port 3100 first. Run `npx playwright install` once. |
| `npm run lhci`          | Lighthouse CI with the budgets from the specification (run after a build).                                                                         |
| `npm run check:content` | The content gate on its own.                                                                                                                       |
| `npm run validate`      | Lint, typecheck, unit tests, then the content check in report mode (lists items, never fails on them).                                             |

## Project structure

```
app/                  layout (fonts, metadata, JSON-LD, skip link), page (section order),
                      globals.css (all design tokens), robots, sitemap, icon, Open Graph image
components/layout/    Navbar, MobileNavigation, ProductsDropdown, Footer, Logo, SkipLink, BackToTop
components/sections/  HeroSection, TechnologyMarquee, CompanyIntro, SolutionsIndex,
                      DataHubShowcase, ShopShowcase, WhySection, ContactSection
components/dashboard/ IoTDashboardPreview, DataHubStory (pinned story), DeviceList, AlertFeed,
                      StepRail, DashboardSidebar, useDemoData
components/shop/      ProductGallery, CategoryTabs, ProductCard, ProductIllustration
components/visuals/   ParticleNetwork (+ particleNetworkEngine.ts), StaticNetwork,
                      AnimatedBackground, AnimatedChart, SolutionIllustrations, PrincipleLine
components/ui/        AnimatedButton, SectionHeading, SensorStatusCard, FeatureList, LoadingSkeleton,
                      EmptyState, ErrorState, DemoBadge, CopyToClipboard, VerifyMarker,
                      ReduceMotionToggle, ScrollProgressIndicator, PreviewBanner, Reveal, ...
content/              all copy, links and facts (typed), plus zod schemas
hooks/                useReducedMotionPreference, useInView, useActiveSection, useMediaQuery,
                      usePageVisibility
lib/                  motion tokens, colour tokens, seeded random, demo data, verification,
                      structured data, cn, assertNever
scripts/checkContent.ts  the content gate
tests/unit, tests/e2e
```

## Editing content (for non-developers)

All words, links and facts live in `content/`. You never need to touch `components/` to change copy.

| What                                                                         | File                        |
| ---------------------------------------------------------------------------- | --------------------------- |
| Company name, page title, meta description, production domain, feature flags | `content/site.ts`           |
| Menu links, product names and one-line descriptions                          | `content/navigation.ts`     |
| Hero eyebrow, headline, supporting text, buttons                             | `content/hero.ts`           |
| Marquee items                                                                | `content/marquee.ts`        |
| About statement, overview, focus areas, photos, mission and vision           | `content/about.ts`          |
| Solutions (titles, summaries, deliverables)                                  | `content/solutions.ts`      |
| IoTDataHub copy, protocols, steps, features, demo badge text                 | `content/dataHub.ts`        |
| Shop categories, highlighted products, audiences                             | `content/shopHighlights.ts` |
| "Why IoT Pioneers" principles                                                | `content/principles.ts`     |
| Email, phone, address, hours, CTA copy                                       | `content/contact.ts`        |
| Social links                                                                 | `content/social.ts`         |

Rules:

1. Keep each item's `verified` set to `false` until the client confirms it. Then set it to `true` and write where the confirmation came from in `source`, for example `"Client email, 2026.12.03"`.
2. Record every confirmation in `CONTENT_VERIFICATION.md`.
3. Write `[VERIFY: what is needed]` for anything unknown. Never invent numbers, clients, awards or features.
4. Mission and vision appear only when both are set and verified (`about.mission`, `about.vision`).
5. Photos go in `public/images/about/` or `public/images/shop/`, under 300KB each. Set the `src` and descriptive `alt` in the content file.
6. Strings are kept whole sentences so French and Kinyarwanda versions can be added later by swapping these files.

After editing, run `npm run validate`.

## Content verification

`scripts/checkContent.ts` validates every content export against `content/schema.ts`, then lists every object with `verified: false` and every `[VERIFY: ...]` string:

- `npm run build` fails while any item remains (75 on 2026.11.20).
- `npm run build:preview` and `npm run validate` list the items and continue. Schema errors fail in every mode.
- Preview and development builds show amber dotted outlines with an "Unverified" tag on every unverified block.
- Organization JSON-LD includes verified fields only, so it is omitted entirely for now.

Facts already published on the two live product sites (contact details, social links, shop categories and product URLs, IoTDataHub features) were used as provisional content, with their source recorded. They still need the client's confirmation. See `CONTENT_VERIFICATION.md`.

## Performance and motion notes

- Hero: Canvas 2D network (70, 45 or 28 nodes by viewport), spatial grid, typed arrays and no allocation in the frame loop, DPR capped at 2, 30 FPS cap on 4-core devices, paused off screen and in hidden tabs. A server-rendered SVG network is the no-JavaScript fallback.
- The dashboard demo and GSAP load only when the IoTDataHub section is within one viewport, with a skeleton that reserves its height and a retry if the chunk fails. The CTA network mounts only near the viewport.
- Every loop (canvas, marquee, live data, pulses) stops off screen and when the tab is hidden.
- Reduced motion (system setting, or the footer "Reduce motion" toggle stored in localStorage) gives static frames, no pinning or parallax, a wrapped static marquee, and a paused dashboard with "Play live demo".
- Without JavaScript all content is visible (a `noscript` style neutralises reveal transforms).

## Decision log

Decisions where the brief was unclear or in conflict, resolved in favour of the most accessible, performant and truthful option.

1. **Content sources.** The live product sites were read on 2026.11.20. Real contact details, social links, shop categories, product names and URLs, and IoTDataHub feature wording come from those pages instead of invented placeholders. All of it remains `verified: false`.
2. **MQTT omitted.** iotdatahub.rw mentions only HTTP. Protocol tags and all demo devices show HTTP only; MQTT appears nowhere until confirmed.
3. **No product photos or prices.** No permission to reuse shop photos yet, so product cards use neutral line illustrations. No prices, stock or ratings are shown, even though the shop lists prices.
4. **No client photography.** The introduction shows two clearly labelled "Photograph pending" technical drawings rather than stock imagery.
5. **Logo.** The client's hosted logo lockup is downloaded to `public/images/brand/iotpioneers-logo.png` (transparent padding trimmed, not cropped or redrawn) and used in the navbar, footer and Open Graph image (design audit batch 2). It stays unverified until the client confirms it and supplies an icon-only SVG; the favicon (`app/icon.svg`) is still the temporary node mark.
6. **Solutions index uses the accordion pattern, not tabs.** Open rows contain links ("Discuss a ... project"). The WAI-ARIA tab pattern forbids interactive content inside a tab list, and tab panels cannot sit between tabs. The rows are therefore accordion headers (`aria-expanded`, labelled regions) with the arrow-key, Home and End navigation the brief asks for. On lg screens the sticky illustration panel and 80ms hover preview behave as specified.
7. **Marquee colours.** Since design audit batch 2 the band is brightGold #D4AF37 with navy text (9.01:1); the hovered item gains a navy underline. The marquee band is a plain container holding a labelled list, so screen readers read the list once.
8. **Products dropdown width.** The specified 240px could not fit a 24px icon, the text and a 44px external-link target. The panel is 320px. It uses the WAI-ARIA disclosure pattern for site navigation (not a `menu` role), because each item contains two links.
9. **Navbar height change.** Height may not be animated, so the 80px to 64px shrink is drawn with transforms: the bar slides up 16px and its content recentres over 240ms.
10. **No shadcn/ui primitives installed.** The dropdown, dialog, tabs, accordion and tooltip each needed custom structure (nested external links, a trap that includes the morphing menu button, links inside accordion panels). They are small hand-written components following the WAI-ARIA Authoring Practices, which avoids several Radix dependencies.
11. **Tablet IoTDataHub story.** At md there is no pinning. Once the demo enters view, the four steps trigger once each, in order, then the dashboard is fully lit. Mobile uses swipeable step cards.
12. **Chart keyboard access.** The chart is a figure with a text summary. Its plot is a `slider` whose value text announces the time and readings as the arrow keys move between points. Tooltips appear on hover, tap and focus.
13. **Demo packets (step 2).** These use SVG `animateMotion` along a curved path, which applies transforms only and renders only during that step and never with reduced motion.
14. **Gradients.** Besides the three allowed backgrounds (hero glow, IoTDataHub glow, CTA), the hero has a functional readability veil required by section 9.02. The CTA fades into the footer over 120px as part of its own gradient. All are defined together in `app/globals.css`.
15. **TypeScript 5.9 rather than 7.0.** typescript-eslint and Next.js type checking target the 5.x compiler API.
16. **Preview mode in development.** `npm run dev` sets `ALLOW_UNVERIFIED_CONTENT=true`, so markers, the banner and the `?shopState=loading|empty|error` test switch are available in development and preview builds and ignored in production.
17. **Footer year** is computed at build time (static page). It updates on the next deploy.

## Deployment

See `docs/15_deployment.md`. A production deploy needs every item in `CONTENT_VERIFICATION.md` confirmed and the production domain set in `content/site.ts`.

## Licence

Proprietary. All rights reserved by IoT PIONEERS Ltd unless the client specifies otherwise.

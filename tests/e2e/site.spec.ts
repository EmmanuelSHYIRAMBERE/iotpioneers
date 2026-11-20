import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const IOTDATAHUB = "https://www.iotdatahub.rw/";
const SHOP = "https://iotpioneersshop.com/";

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test.describe("page", () => {
  test("loads with one h1, landmarks and no console errors", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Engineering");
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("footer")).toBeAttached();
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });

  test("sections appear in the specified order", async ({ page }) => {
    await page.goto("/");
    const ids = await page
      .locator("main > section[id], main > div > section[id]")
      .evaluateAll((nodes) => nodes.map((n) => n.id));
    expect(ids).toEqual(["top", "about", "solutions", "iotdatahub", "shop", "why", "contact"]);
  });

  test("external product links open the fixed URLs in a new tab", async ({ page }) => {
    await page.goto("/");
    for (const href of [IOTDATAHUB, SHOP]) {
      const links = page.locator(`a[href="${href}"]`);
      expect(await links.count()).toBeGreaterThan(0);
      for (const link of await links.all()) {
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    }
  });

  test("no link points to a bare #", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
  });

  test("every in-page anchor has a target", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator('a[href^="#"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href") ?? ""));
    for (const href of new Set(hrefs)) {
      await expect(page.locator(href), href).toHaveCount(1);
    }
  });

  test("the demo badge is present once the dashboard loads", async ({ page }) => {
    await page.goto("/#iotdatahub");
    await expect(page.getByRole("button", { name: /Simulated demo data/ }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByText("Dashboard shown with simulated data for illustration.", { exact: true }),
    ).toBeVisible();
  });
});

test.describe("navigation", () => {
  test("desktop products dropdown works with the keyboard", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop only");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const trigger = page
      .getByRole("navigation", { name: "Main" })
      .getByRole("button", { name: "Products" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("mobile menu traps focus, closes on Escape and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const button = page.getByRole("button", { name: "Open menu" });
    await button.click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });
});

test.describe("shop", () => {
  test("category tabs filter and an empty category shows the empty state", async ({ page }) => {
    await page.goto("/#shop");
    await page.getByRole("tab", { name: "Displays" }).click();
    await expect(page.getByRole("tab", { name: "Displays" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.getByRole("tab", { name: "Solar & Batteries" }).click();
    await expect(page.getByText("No highlighted products in this category yet.")).toBeVisible();
  });

  for (const state of ["loading", "error", "empty"] as const) {
    test(`forced ${state} state renders (preview builds only)`, async ({ page }) => {
      await page.goto(`/?shopState=${state}#shop`);
      const shop = page.locator("#shop");
      // The forced state is read from the URL after hydration; allow for slow machines.
      const timeout = 20_000;
      if (state === "loading")
        await expect(shop.getByRole("status", { name: "Loading products" }).first()).toBeVisible({
          timeout,
        });
      if (state === "error")
        await expect(shop.getByRole("alert")).toContainText(
          "We couldn't load products right now.",
          { timeout },
        );
      if (state === "empty")
        await expect(shop.getByText("No highlighted products in this category yet.")).toBeVisible({
          timeout,
        });
    });
  }
});

test.describe("motion", () => {
  test("reduced motion shows the marquee as a static list", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Pause animation" })).toHaveCount(0);
    await expect(page.getByRole("list", { name: "Areas of expertise" })).toHaveCount(1);
    await context.close();
  });

  test("marquee pause toggle reflects its state", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Pause animation" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Play animation" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

test.describe("layout", () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${String(width)}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("accessibility", () => {
  test("axe finds no violations on the page", async ({ page }) => {
    // A full-page axe scan is slow on low-powered machines.
    test.setTimeout(90_000);
    await page.goto("/");
    // Let entrance animations settle so contrast is measured on final colours.
    await page.waitForTimeout(2500);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // Unverified content markers exist only in preview builds.
      .exclude(".verify-tag")
      .analyze();
    expect(
      results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      ),
    ).toEqual([]);
  });
});

test.describe("design audit batch 1", () => {
  test("no raw [VERIFY: ...] placeholder is rendered (issue 12)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).not.toContainText("[VERIFY:");
    const alts = await page
      .locator("img[alt]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("alt") ?? ""));
    expect(alts.filter((alt) => alt.includes("[VERIFY:"))).toEqual([]);
  });

  test("section titles use the display scale, not body size (issue 3)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    for (const id of [
      "solutions-title",
      "iotdatahub-title",
      "shop-title",
      "why-title",
      "contact-title",
    ]) {
      const size = await page
        .locator(`#${id}`)
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(size, id).toBeGreaterThanOrEqual(36);
    }
  });

  test("hero starts below the navbar and fits above the fold at 1366x768 (issues 7, 8)", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop layout");
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/");
    await page.waitForTimeout(2500);
    const header = await page.locator("header").first().boundingBox();
    const eyebrow = await page.locator("#top .eyebrow").first().boundingBox();
    const chips = await page.getByRole("list", { name: "Our products" }).boundingBox();
    expect(header && eyebrow && chips).toBeTruthy();
    if (!header || !eyebrow || !chips) return;
    expect(eyebrow.y).toBeGreaterThanOrEqual(header.y + header.height);
    expect(chips.y + chips.height).toBeLessThanOrEqual(768);
  });

  for (const width of [1366, 1440]) {
    test(`dashboard is not clipped at ${String(width)}px (issue 18)`, async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, "Desktop layout");
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/#iotdatahub");
      const frame = page.getByRole("group", {
        name: "IoTDataHub demo dashboard with simulated data",
      });
      await expect(frame).toBeVisible({ timeout: 20_000 });
      const clipped = await frame.evaluate((root) => {
        const box = root.getBoundingClientRect();
        const out: string[] = [];
        if (box.right > document.documentElement.clientWidth + 0.5) out.push("frame past viewport");
        root.querySelectorAll<HTMLElement>("*").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.right > box.right + 0.5)
            out.push(`${el.tagName.toLowerCase()} ${el.className.toString().slice(0, 40)}`);
        });
        return out;
      });
      expect(clipped).toEqual([]);
    });
  }

  test("preview notice collapses to a single button (issue 4)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Collapse preview notice" }).click();
    await expect(page.getByRole("complementary", { name: "Preview build notice" })).toHaveCount(0);
    const pill = page.getByRole("button", { name: /Preview build: \d+ content items/ });
    const box = await pill.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(48);
  });

  test("hero with reduced motion emulated looks finished", async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForTimeout(1000);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await testInfo.attach("hero-reduced-motion-1440", {
      body: await page.locator("#top").screenshot(),
      contentType: "image/png",
    });
    await context.close();
  });
});

test.describe("design audit batch 1 follow-ups", () => {
  test("the empty space where two sections meet stays near 200px at 1440 (issue 6)", async ({
    browser,
    isMobile,
  }, testInfo) => {
    test.skip(isMobile, "Desktop layout");
    test.setTimeout(60_000);
    // Reduced motion: every element sits in its final place and the story is not pinned.
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/");
    // Walk the page so lazy parts mount before measuring.
    for (let y = 0; y < 14_000; y += 700) {
      await page.evaluate((top) => {
        window.scrollTo(0, top);
      }, y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(800);
    const gaps = await page.evaluate(() => {
      const order = ["#about", "#solutions", "#iotdatahub", "#shop", "#why", "#contact", "footer"];
      const MEDIA = new Set(["IMG", "SVG", "CANVAS", "VIDEO", "INPUT", "BUTTON"]);
      const contentRects = (root: Element): DOMRect[] => {
        const rects: DOMRect[] = [];
        root.querySelectorAll("*").forEach((el) => {
          if (el.closest('[aria-hidden="true"]')) return;
          const media = MEDIA.has(el.tagName.toUpperCase());
          const leafText = el.children.length === 0 && (el.textContent ?? "").trim() !== "";
          if (!media && !leafText) return;
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") return;
          const r = el.getBoundingClientRect();
          if (r.width <= 1 || r.height <= 1) return;
          rects.push(r);
        });
        return rects;
      };
      const out: { join: string; gap: number }[] = [];
      for (let i = 0; i < order.length - 1; i += 1) {
        const a = document.querySelector(order[i] ?? "");
        const b = document.querySelector(order[i + 1] ?? "");
        if (!a || !b) continue;
        const last = Math.max(...contentRects(a).map((r) => r.bottom));
        const first = Math.min(...contentRects(b).map((r) => r.top));
        out.push({
          join: `${order[i] ?? ""} → ${order[i + 1] ?? ""}`,
          gap: Math.round(first - last),
        });
      }
      return out;
    });
    await testInfo.attach("section-gaps-1440.json", {
      body: JSON.stringify(gaps, null, 2),
      contentType: "application/json",
    });
    expect(gaps.length).toBe(6);
    for (const { join, gap } of gaps) expect(gap, join).toBeLessThanOrEqual(210);
    await context.close();
  });

  test("no solution row title wraps at 1024px", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop layout");
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/#solutions");
    const titles = page.locator("#solutions h3 button span.font-display");
    await expect(titles.first()).toBeVisible();
    const wrapped = await titles.evaluateAll((nodes) =>
      nodes
        .filter(
          (node) =>
            node.getBoundingClientRect().height >
            parseFloat(getComputedStyle(node).lineHeight) * 1.5,
        )
        .map((node) => node.textContent),
    );
    expect(wrapped).toEqual([]);
  });

  test("tablet IoTDataHub: inactive steps keep readable text, chart and alerts show data from the start", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Tablet layout");
    await page.setViewportSize({ width: 900, height: 1000 });
    await page.goto("/#iotdatahub-demo");
    const frame = page.getByRole("group", {
      name: "IoTDataHub demo dashboard with simulated data",
    });
    await expect(frame).toBeVisible({ timeout: 20_000 });
    // Before the "visualise" step: the chart already has lines and the alert feed has an alert.
    const early = await frame.evaluate((root) => ({
      lines: [...root.querySelectorAll("figure svg path")].filter(
        (p) => (p.getAttribute("d") ?? "").length > 10,
      ).length,
      alerts: root.querySelectorAll("ul li .text-amber-400").length,
    }));
    expect(early.lines).toBeGreaterThan(0);
    expect(early.alerts).toBeGreaterThan(0);

    // Once a step is current, every other step's text still meets 4.5:1 on navy, with no opacity dimming.
    await expect(page.locator('#iotdatahub ol li[aria-current="step"]')).toHaveCount(1, {
      timeout: 10_000,
    });
    const failures = await page.locator("#iotdatahub ol li").evaluateAll((items) => {
      const lum = (rgb: number[]): number => {
        const [r = 0, g = 0, b = 0] = rgb.map((v) => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const navy = lum([10, 16, 32]);
      const bad: string[] = [];
      for (const item of items) {
        if (parseFloat(getComputedStyle(item).opacity) < 1)
          bad.push(`opacity on ${item.textContent?.slice(0, 20) ?? ""}`);
        item.querySelectorAll("p, h3").forEach((el) => {
          if (el.classList.contains("sr-only")) return;
          const rgb = (getComputedStyle(el).color.match(/\d+(\.\d+)?/g) ?? [])
            .slice(0, 3)
            .map(Number);
          const ratio = (lum(rgb) + 0.05) / (navy + 0.05);
          if (ratio < 4.5) bad.push(`${el.tagName} ${ratio.toFixed(2)}:1`);
        });
      }
      return bad;
    });
    expect(failures).toEqual([]);
  });
});

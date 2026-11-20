import { describe, expect, it } from "vitest";
import { contentSchemas, solutionSchema } from "@/content/schema";
import { navItems, PRODUCT_URLS, products } from "@/content/navigation";
import { dataHub } from "@/content/dataHub";
import { shopHeading, shopHighlights } from "@/content/shopHighlights";
import { contentModules } from "@/lib/contentRegistry";
import { buildOrganizationJsonLd } from "@/lib/structuredData";
import {
  collectAllIssues,
  collectIssues,
  evaluateGate,
  isPlaceholder,
  resolveSiteUrl,
} from "@/lib/verification";
import { contact } from "@/content/contact";

describe("collectIssues", () => {
  it("finds unverified objects and placeholders, with paths", () => {
    const issues = collectIssues(
      "demo",
      { verified: false, source: "s", items: [{ text: "[VERIFY: x]" }] },
      "root",
    );
    expect(issues).toEqual([
      { file: "demo", path: "root", kind: "unverified", detail: "s" },
      { file: "demo", path: "root.items[0].text", kind: "placeholder", detail: "[VERIFY: x]" },
    ]);
  });

  it("ignores verified objects without placeholders", () => {
    expect(collectIssues("demo", { verified: true, source: "client", text: "ok" }, "x")).toEqual(
      [],
    );
  });

  it("detects placeholders", () => {
    expect(isPlaceholder("Kigali · [VERIFY: year]")).toBe(true);
    expect(isPlaceholder("Kigali")).toBe(false);
  });
});

describe("evaluateGate", () => {
  const issue = { file: "f", path: "p", kind: "unverified" as const, detail: "d" };

  it("fails a production build while anything is unverified", () => {
    expect(evaluateGate([issue], [], { allowUnverified: false, reportOnly: false }).ok).toBe(false);
  });

  it("passes in preview mode and report mode, listing the items", () => {
    const preview = evaluateGate([issue], [], { allowUnverified: true, reportOnly: false });
    expect(preview.ok).toBe(true);
    expect(preview.report).toContain("content/f.ts");
    expect(evaluateGate([issue], [], { allowUnverified: false, reportOnly: true }).ok).toBe(true);
  });

  it("always fails on schema errors", () => {
    expect(evaluateGate([], ["bad"], { allowUnverified: true, reportOnly: true }).ok).toBe(false);
  });
});

describe("content", () => {
  it("passes every schema", () => {
    for (const [key, schema] of Object.entries(contentSchemas)) {
      const [file, name] = key.split(".");
      const value = file && name ? contentModules[file]?.[name] : undefined;
      const result = schema.safeParse(value);
      expect(
        result.success,
        `${key}: ${result.success ? "" : JSON.stringify(result.error.issues)}`,
      ).toBe(true);
    }
  });

  it("rejects malformed content", () => {
    expect(solutionSchema.safeParse({ id: "x", verified: false }).success).toBe(false);
  });

  it("is currently unverified (the production gate is expected to fail until the client confirms)", () => {
    expect(collectAllIssues(contentModules).length).toBeGreaterThan(0);
  });

  it("links only to the two fixed product domains", () => {
    expect(PRODUCT_URLS).toEqual({
      iotdatahub: "https://www.iotdatahub.rw/",
      shop: "https://iotpioneersshop.com/",
    });
    expect(products.map((p) => p.externalHref)).toEqual([
      "https://www.iotdatahub.rw/",
      "https://iotpioneersshop.com/",
    ]);
    expect(dataHub.cta.href).toBe(PRODUCT_URLS.iotdatahub);
    expect(shopHeading.cta.href).toBe(PRODUCT_URLS.shop);
    expect(shopHighlights.every((p) => p.href.startsWith(PRODUCT_URLS.shop))).toBe(true);
  });

  it("has no dead in-page links", () => {
    expect(navItems.every((item) => /^#[a-z]+$/.test(item.href))).toBe(true);
  });

  it("never lists prices, stock or ratings for products", () => {
    const text = JSON.stringify(shopHighlights);
    expect(text).not.toMatch(/RWF|price|in stock|rating/i);
  });
});

describe("structured data", () => {
  it("omits everything while the organisation name is unverified", () => {
    expect(
      buildOrganizationJsonLd({
        legalName: { text: "IoT PIONEERS Ltd", verified: false, source: "" },
        siteUrl: resolveSiteUrl("[VERIFY: domain]"),
        siteUrlVerified: false,
        contact,
        social: [],
        logoPath: null,
      }),
    ).toBeNull();
  });

  it("includes only verified fields", () => {
    const data = buildOrganizationJsonLd({
      legalName: { text: "IoT PIONEERS Ltd", verified: true, source: "client" },
      siteUrl: new URL("https://example.rw"),
      siteUrlVerified: true,
      contact: { ...contact, verified: false },
      social: [
        {
          platform: "youtube",
          label: "y",
          href: "https://youtube.com/x",
          verified: false,
          source: "",
        },
      ],
      logoPath: null,
    });
    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "IoT PIONEERS Ltd",
      url: "https://example.rw/",
    });
  });

  it("falls back to localhost while the domain is a placeholder", () => {
    expect(resolveSiteUrl("[VERIFY: production domain]").origin).toBe("http://localhost:3000");
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cn, customTheme } from "@/lib/cn";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

/** Token names declared in the @theme block for a namespace, e.g. --text-h3 (ignoring --text-h3--line-height). */
function themeNames(namespace: string): string[] {
  const pattern = new RegExp(`--${namespace}-([a-z0-9-]+?):`, "g");
  return [...css.matchAll(pattern)]
    .map((match) => match[1] ?? "")
    .filter((name) => name && !name.includes("--"));
}

describe("cn and the custom theme (audit issue 3)", () => {
  it.each(customTheme.text)("keeps font size text-%s when a colour class follows", (size) => {
    expect(cn(`font-display text-${size}`, "text-cloud-50").split(" ")).toEqual(
      expect.arrayContaining([`text-${size}`, "text-cloud-50"]),
    );
  });

  it("still lets a later font size override an earlier one", () => {
    expect(cn("text-h3 text-cloud-50", "text-h4")).toBe("text-cloud-50 text-h4");
  });

  it("keeps custom shadows next to a shadow colour, and merges two custom shadows", () => {
    expect(cn("shadow-rest", "shadow-navy-950")).toBe("shadow-rest shadow-navy-950");
    expect(cn("shadow-rest", "shadow-hover")).toBe("shadow-hover");
  });

  it("merges custom radius, easing, animation and container values", () => {
    expect(cn("rounded-card", "rounded-full")).toBe("rounded-full");
    expect(cn("ease-in", "ease-out-expo")).toBe("ease-out-expo");
    expect(cn("animate-bob", "animate-none")).toBe("animate-none");
    expect(cn("max-w-lead", "max-w-full")).toBe("max-w-full");
  });

  it("registers every font size, radius and shadow declared in globals.css", () => {
    for (const name of themeNames("text")) expect(customTheme.text).toContain(name);
    for (const name of themeNames("radius").filter((n) => n !== "full"))
      expect(customTheme.radius).toContain(name);
    for (const name of themeNames("shadow")) expect(customTheme.shadow).toContain(name);
  });
});

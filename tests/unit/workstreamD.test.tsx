import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/layout/Footer";
import { PathTableSection } from "@/components/sections/PathTableSection";
import { FeatureList } from "@/components/ui/FeatureList";
import { pathNeeds, pathOfferings } from "@/content/pathTable";
import { socialLinks } from "@/content/social";
import { Activity, Plug } from "lucide-react";

describe("PathTableSection (Which do you need?)", () => {
  it("renders a real table with a caption, column and row headers", () => {
    render(<PathTableSection />);
    const table = screen.getByRole("table", { name: /Which IoT Pioneers offering fits each need/ });
    const columnHeaders = within(table).getAllByRole("columnheader");
    // "What you need" plus one column per offering.
    expect(columnHeaders).toHaveLength(pathOfferings.length + 1);
    for (const offering of pathOfferings) {
      expect(within(table).getByRole("columnheader", { name: offering.name })).toBeInTheDocument();
    }
    for (const need of pathNeeds) {
      expect(within(table).getByRole("rowheader", { name: need.label })).toBeInTheDocument();
    }
  });

  it("marks every cell Yes or No in text, never with crosses or ratings", () => {
    render(<PathTableSection />);
    const table = screen.getByRole("table");
    const cells = within(table)
      .getAllByRole("cell")
      .filter((cell) => !cell.querySelector("a"));
    expect(cells).toHaveLength(pathNeeds.length * pathOfferings.length);
    for (const cell of cells) expect(["Yes", "No"]).toContain(cell.textContent);
    const yes = cells.filter((cell) => cell.textContent === "Yes").length;
    expect(yes).toBe(pathOfferings.reduce((sum, offering) => sum + offering.serves.length, 0));
  });

  it("gives every CTA an accessible name that names its destination", () => {
    render(<PathTableSection />);
    for (const offering of pathOfferings) {
      const links = screen.getAllByRole("link", { name: new RegExp(offering.ctaAccessibleName) });
      // One in the table footer, one on the mobile card.
      expect(links).toHaveLength(2);
      for (const link of links) expect(link).toHaveAttribute("href", offering.href);
    }
    expect(screen.queryByRole("link", { name: /^learn more$/i })).toBeNull();
  });

  it("renders one mobile card per offering listing only the needs it serves", () => {
    render(<PathTableSection />);
    const list = screen.getByRole("list", { name: /Which IoT Pioneers offering fits each need/ });
    expect(list).toHaveClass("md:hidden");
    const cards = within(list).getAllByRole("heading", { level: 3 });
    expect(cards.map((card) => card.textContent)).toEqual(pathOfferings.map((o) => o.name));
    const table = screen.getByRole("table");
    // The table wrapper is hidden below md, so only one version is exposed at any width.
    expect(table.closest(".hidden.md\\:block")).not.toBeNull();
  });
});

describe("FeatureList (card system, issue 23)", () => {
  it("renders a numbered row of cards with the gold top bar", () => {
    render(
      <FeatureList
        items={[
          { id: "a", title: "Connect", text: "One line.", icon: Plug, verified: false },
          { id: "b", title: "Monitor", text: "One line.", icon: Activity, verified: false },
        ]}
      />,
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(list.querySelectorAll(".card-topbar")).toHaveLength(2);
  });
});

describe("Footer", () => {
  it("names every social link and says it opens in a new tab", () => {
    render(<Footer />);
    const social = screen.getByRole("list", { name: "Social media" });
    const links = within(social).getAllByRole("link");
    expect(links).toHaveLength(socialLinks.length);
    socialLinks.forEach((item, index) => {
      expect(links[index]).toHaveAccessibleName(`${item.label} (opens in a new tab)`);
    });
  });

  it("computes the copyright year and never shows a placeholder", () => {
    render(<Footer />);
    const year = String(new Date().getFullYear());
    expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\{year\}/);
  });

  it("keeps the product link icon on the same line as the last word (issue 34)", () => {
    render(<Footer />);
    const products = screen.getByRole("navigation", { name: "Products" });
    const link = within(products).getByRole("link", { name: /IoT Pioneers Shop/ });
    const group = link.querySelector(".whitespace-nowrap");
    expect(group?.textContent).toBe(`Shop${String.fromCharCode(160)}`);
    expect(group?.querySelector("svg")).not.toBeNull();
  });

  it("has four columns: brand, Company, Products and Contact, plus Back to top", () => {
    render(<Footer />);
    expect(screen.getByRole("navigation", { name: "Company" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Products" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to top" })).toBeInTheDocument();
  });
});

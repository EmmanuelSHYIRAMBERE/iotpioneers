import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CategoryTabs } from "@/components/shop/CategoryTabs";
import { ProductCard } from "@/components/shop/ProductCard";
import { AnimatedChart } from "@/components/visuals/AnimatedChart";
import { shopHighlights } from "@/content/shopHighlights";
import type { StockImage } from "@/content/types";

const TABS = [
  { id: "all", label: "All" },
  { id: "boards", label: "Boards" },
  { id: "sensors", label: "Sensors" },
  { id: "displays", label: "Displays" },
];

function Pills() {
  const [value, setValue] = useState("all");
  return (
    <CategoryTabs tabs={TABS} value={value} onChange={setValue} panelId="panel" idPrefix="p" />
  );
}

describe("pill filters (audit issue 25)", () => {
  it("keeps the tabs pattern: arrows wrap, Home and End jump, focus follows selection", async () => {
    const user = userEvent.setup();
    render(<Pills />);
    expect(screen.getByRole("tablist", { name: "Product categories" })).toBeInTheDocument();
    screen.getByRole("tab", { name: "All" }).focus();

    await user.keyboard("{ArrowRight}");
    const boards = screen.getByRole("tab", { name: "Boards" });
    expect(boards).toHaveAttribute("aria-selected", "true");
    expect(boards).toHaveFocus();
    expect(boards).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("tabindex", "-1");

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Displays" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Displays" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "All" })).toHaveFocus();
  });
});

const stock: StockImage = {
  src: "/images/shop/boards.jpg",
  alt: "Illustrative image: a development board",
  width: 640,
  height: 640,
  photographer: "Test",
  sourceUrl: "https://unsplash.com/photos/test",
  illustrative: true,
  verified: false,
  source: "test",
};

describe("product card links (audit issues 26, 27, 28)", () => {
  it("names the product and the shop in the accessible name and shows the short name", () => {
    render(
      <ProductCard
        name="ESP32 ESP-32 Wireless WiFi Bluetooth Development Board"
        displayName="ESP32 Development Board"
        category="Arduino & Board Modules"
        image={null}
        categoryImage={null}
        illustration="board"
        href="https://iotpioneersshop.com/product/esp32/"
        verified
        position={1}
        total={4}
        illustrativeLabel="Illustrative image"
      />,
    );
    // getByRole matches on the computed accessible name (Testing Library, no extra dependency).
    const link = screen.getByRole("link", {
      name: (name) =>
        name
          .replace(/\s+/g, " ")
          .includes(
            "View ESP32 ESP-32 Wireless WiFi Bluetooth Development Board in the IoT Pioneers shop",
          ) && name.includes("(opens in a new tab)"),
    });
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByText("ESP32 Development Board")).toBeVisible();
    expect(screen.queryByText("Illustrative image")).not.toBeInTheDocument();
  });

  it("labels a stand-in category photo as illustrative, visibly and in the alt text", () => {
    render(
      <ProductCard
        name="Arduino Uno"
        displayName="Arduino Uno"
        category="Arduino & Board Modules"
        image={null}
        categoryImage={stock}
        illustration="board"
        href="https://iotpioneersshop.com/product/arduino-uno/"
        verified
        position={2}
        total={4}
        illustrativeLabel="Illustrative image"
      />,
    );
    expect(screen.getByText("Illustrative image")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Illustrative image/ })).toBeInTheDocument();
  });

  it("gives every highlighted product a short display name of at most four words", () => {
    for (const product of shopHighlights) {
      expect(product.displayName, product.id).toBeTruthy();
      expect((product.displayName ?? "").split(/\s+/).length, product.id).toBeLessThanOrEqual(4);
    }
  });
});

describe("chart legend (audit issue 21)", () => {
  it("shows each series with its unit and draws humidity dashed", () => {
    const readings = (unit: "°C" | "%", base: number) =>
      Array.from({ length: 8 }, (_, i) => ({ timestamp: 1_000 * i, value: base + i, unit }));
    const { container } = render(
      <AnimatedChart
        series={[
          {
            id: "temperature",
            label: "Temperature",
            color: "#22D3EE",
            decimals: 1,
            unit: "°C",
            readings: readings("°C", 20),
            visible: true,
          },
          {
            id: "humidity",
            label: "Humidity",
            color: "#60A5FA",
            decimals: 0,
            unit: "%",
            dashed: true,
            readings: readings("%", 50),
            visible: true,
          },
        ]}
        summary="Temperature rising, humidity rising."
        drawn
        instant
        rangeKey="1H"
      />,
    );
    expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
    expect(screen.getByText("Humidity (%)")).toBeInTheDocument();
    const dashed = [...container.querySelectorAll("path")].filter((path) =>
      path.getAttribute("stroke-dasharray"),
    );
    expect(dashed.length).toBeGreaterThan(0);
    expect(container.textContent).toMatch(/\d+°C/);
    expect(container.textContent).toMatch(/\d+%/);
  });
});

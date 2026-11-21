import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { solutions } from "@/content/solutions";
import { CategoryTabs } from "@/components/shop/CategoryTabs";
import { SolutionsIndexClient } from "@/components/sections/SolutionsIndexClient";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { CopyToClipboard } from "@/components/ui/CopyToClipboard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ReduceMotionToggle } from "@/components/ui/ReduceMotionToggle";
import { REDUCE_MOTION_STORAGE_KEY } from "@/lib/motion";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("AnimatedButton", () => {
  it("renders external links with new tab, rel and the hidden notice", () => {
    render(
      <AnimatedButton href="https://www.iotdatahub.rw/" external>
        Explore IoTDataHub
      </AnimatedButton>,
    );
    const link = screen.getByRole("link", { name: /Explore IoTDataHub \(opens in a new tab\)/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a button when there is no href, and reports busy while loading", () => {
    render(<AnimatedButton loading>Send</AnimatedButton>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("aria-busy", "true");
  });
});

describe("CopyToClipboard", () => {
  it("announces success and resets after 1.6 seconds", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<CopyToClipboard value="hello@example.com" label="email address" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy email address" }));
      await Promise.resolve();
    });
    expect(writeText).toHaveBeenCalledWith("hello@example.com");
    expect(screen.getByRole("status")).toHaveTextContent("email address copied");
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("explains what to do when copying fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("no")) },
      configurable: true,
    });
    render(<CopyToClipboard value="x" label="phone number" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy phone number" }));
      await Promise.resolve();
    });
    expect(screen.getByRole("status")).toHaveTextContent("Copy failed, select the text instead");
  });
});

describe("EmptyState and ErrorState", () => {
  it("EmptyState is not an alert", () => {
    render(<EmptyState message="No highlighted products in this category yet." />);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("No highlighted products in this category yet.")).toBeInTheDocument();
  });

  it("ErrorState announces itself and offers a way forward", () => {
    render(
      <ErrorState
        message="We couldn't load products right now."
        retry={<button type="button">Try again</button>}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't load products right now.");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});

describe("ReduceMotionToggle", () => {
  it("persists the choice and sets the html attribute", async () => {
    const user = userEvent.setup();
    render(<ReduceMotionToggle />);
    const toggle = screen.getByRole("switch", { name: "Reduce motion" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(window.localStorage.getItem(REDUCE_MOTION_STORAGE_KEY)).toBe("true");
    expect(document.documentElement.dataset.reduceMotion).toBe("true");
    await user.click(toggle);
    expect(window.localStorage.getItem(REDUCE_MOTION_STORAGE_KEY)).toBe("false");
  });
});

describe("SolutionsIndex", () => {
  it("opens the first row by default and moves between rows with the arrow keys", async () => {
    // The scroll story with its keyboard list renders at lg and up (improvement run 2, task 7).
    const original = window.matchMedia.bind(window);
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      ...original(query),
      matches: query === "(min-width: 1024px)",
    }));
    const user = userEvent.setup();
    render(<SolutionsIndexClient solutions={solutions} />);
    const rows = screen
      .getAllByRole("button", { expanded: false })
      .concat(screen.getAllByRole("button", { expanded: true }));
    expect(rows).toHaveLength(solutions.length);
    const first = screen.getByRole("button", { name: /Internet of Things/ });
    expect(first).toHaveAttribute("aria-expanded", "true");
    first.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: /Software Development/ })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: /Technology Integration/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /Technology Integration/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(first).toHaveAttribute("aria-expanded", "false");
  });
});

describe("CategoryTabs", () => {
  it("follows the tabs pattern with arrow keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CategoryTabs
        tabs={[
          { id: "all", label: "All" },
          { id: "displays", label: "Displays" },
        ]}
        value="all"
        onChange={onChange}
        panelId="panel"
        idPrefix="t"
      />,
    );
    const all = screen.getByRole("tab", { name: "All" });
    expect(all).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Displays" })).toHaveAttribute("tabindex", "-1");
    all.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("displays");
  });
});

describe("SolutionsIndexClient below lg", () => {
  it("shows every capability as a stacked card with its text", () => {
    render(<SolutionsIndexClient solutions={solutions} />);
    for (const solution of solutions) {
      expect(screen.getByRole("heading", { name: new RegExp(solution.title) })).toBeInTheDocument();
      expect(screen.getByText(solution.summary)).toBeInTheDocument();
    }
  });
});

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FilterDropdown } from "../FilterDropdown";
import { Tier } from "../../../models/Activity";

afterEach(() => {
  cleanup();
});

describe("FilterDropdown", () => {
  it("renders the title", () => {
    render(
      <FilterDropdown
        title="interest"
        value={Tier.MEDIUM}
        handleChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Interest")).toBeInTheDocument();
  });

  it("renders the current value", () => {
    render(
      <FilterDropdown
        title="interest"
        value={Tier.MEDIUM}
        handleChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Medium");
  });

  it("renders all tier options", () => {
    render(
      <FilterDropdown
        title="interest"
        value={Tier.LOW}
        handleChange={vi.fn()}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: "Low" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Medium" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "High" })).toBeInTheDocument();
  });

  it.each([
    [Tier.LOW, "Low"],
    [Tier.MEDIUM, "Medium"],
    [Tier.HIGH, "High"],
  ])("renders %s as the selected value", (tier, label) => {
    render(
      <FilterDropdown title="interest" value={tier} handleChange={vi.fn()} />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent(label);
  });

  it("calls handleChange when a new tier is selected", () => {
    const handleChange = vi.fn();

    render(
      <FilterDropdown
        title="interest"
        value={Tier.LOW}
        handleChange={handleChange}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));

    fireEvent.click(screen.getByRole("option", { name: "High" }));

    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange).toHaveBeenCalledWith(Tier.HIGH);
  });

  it.each([
    [Tier.MEDIUM, Tier.LOW, "Low"],
    [Tier.LOW, Tier.MEDIUM, "Medium"],
    [Tier.LOW, Tier.HIGH, "High"],
  ])("calls handleChange with %s", (initialTier, tier, label) => {
    const handleChange = vi.fn();

    render(
      <FilterDropdown
        title="effort"
        value={initialTier}
        handleChange={handleChange}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: label }));

    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange).toHaveBeenCalledWith(tier);
  });

  it("formats a lowercase title as title case", () => {
    render(
      <FilterDropdown title="effort" value={Tier.LOW} handleChange={vi.fn()} />,
    );

    expect(screen.getByText("Effort")).toBeInTheDocument();
  });
});

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNavigate } from "react-router-dom";

import PickEmHomeActionButtons from "../PickEmHomeActionsButtons";
import { getCategories } from "../../../api/client";
import { Tier } from "../../../models/Activity";
import type { Category } from "../../../models/Category";

vi.mock("../../../api/client", () => ({
  getCategories: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockGetCategories = vi.mocked(getCategories);
const mockNavigate = vi.fn();

const setSelectedCategories = vi.fn();
const makePick = vi.fn();
const setError = vi.fn();

const selectedCategoriesIds = ["movies", "podcasts"];

const categories: Category[] = [
  {
    id: "movies",
    activities: [],
  },
  {
    id: "podcasts",
    activities: [],
  },
];

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useNavigate).mockReturnValue(
    mockNavigate as ReturnType<typeof useNavigate>,
  );
});

afterEach(() => {
  cleanup();
});

describe("PickEmHomeActionButtons", () => {
  it("renders the action buttons", () => {
    render(
      <PickEmHomeActionButtons
        selectedCategoriesIds={selectedCategoriesIds}
        setSelectedCategories={setSelectedCategories}
        interest={Tier.MEDIUM}
        effort={Tier.LOW}
        makePick={makePick}
        setError={setError}
      />,
    );

    expect(screen.getByRole("button", { name: "Pick" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Explore" })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Add Activity" }),
    ).toBeInTheDocument();
  });

  it("disables Pick when no categories are selected", () => {
    render(
      <PickEmHomeActionButtons
        selectedCategoriesIds={[]}
        setSelectedCategories={setSelectedCategories}
        interest={Tier.MEDIUM}
        effort={Tier.LOW}
        makePick={makePick}
        setError={setError}
      />,
    );

    expect(screen.getByRole("button", { name: "Pick" })).toBeDisabled();
  });

  it("disables Explore when no categories are selected", () => {
    render(
      <PickEmHomeActionButtons
        selectedCategoriesIds={[]}
        setSelectedCategories={setSelectedCategories}
        interest={Tier.MEDIUM}
        effort={Tier.LOW}
        makePick={makePick}
        setError={setError}
      />,
    );

    expect(screen.getByRole("button", { name: "Explore" })).toBeDisabled();
  });

  it("enables Pick when categories, interest, and effort are selected", () => {
    render(
      <PickEmHomeActionButtons
        selectedCategoriesIds={selectedCategoriesIds}
        setSelectedCategories={setSelectedCategories}
        interest={Tier.MEDIUM}
        effort={Tier.LOW}
        makePick={makePick}
        setError={setError}
      />,
    );

    expect(screen.getByRole("button", { name: "Pick" })).toBeEnabled();
  });

  it("calls makePick when Pick is clicked", () => {
    render(
      <PickEmHomeActionButtons
        selectedCategoriesIds={selectedCategoriesIds}
        setSelectedCategories={setSelectedCategories}
        interest={Tier.MEDIUM}
        effort={Tier.LOW}
        makePick={makePick}
        setError={setError}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pick" }));

    expect(makePick).toHaveBeenCalledOnce();
  });

  it("fetches selected categories when Explore is clicked", async () => {
    mockGetCategories.mockResolvedValue(categories);

    render(
      <PickEmHomeActionButtons
        selectedCategoriesIds={selectedCategoriesIds}
        setSelectedCategories={setSelectedCategories}
        interest={Tier.MEDIUM}
        effort={Tier.LOW}
        makePick={makePick}
        setError={setError}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));

    await vi.waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalledOnce();
    });

    expect(mockGetCategories).toHaveBeenCalledWith(selectedCategoriesIds);

    expect(setSelectedCategories).toHaveBeenCalledOnce();
    expect(setSelectedCategories).toHaveBeenCalledWith(categories);
  });

  it("sets an error when fetching categories fails", async () => {
    mockGetCategories.mockRejectedValue(new Error("API failure"));

    render(
      <PickEmHomeActionButtons
        selectedCategoriesIds={selectedCategoriesIds}
        setSelectedCategories={setSelectedCategories}
        interest={Tier.MEDIUM}
        effort={Tier.LOW}
        makePick={makePick}
        setError={setError}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));

    await vi.waitFor(() => {
      expect(setError).toHaveBeenCalledOnce();
    });

    expect(setError).toHaveBeenCalledWith(
      "Failed to fetch selected categories from server",
    );
  });

  it("navigates to the new activity page", () => {
    render(
      <PickEmHomeActionButtons
        selectedCategoriesIds={[]}
        setSelectedCategories={setSelectedCategories}
        interest={Tier.MEDIUM}
        effort={Tier.LOW}
        makePick={makePick}
        setError={setError}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Activity" }));

    expect(mockNavigate).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith("/activities/new");
  });
});

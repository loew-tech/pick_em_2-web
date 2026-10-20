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

const renderButtons = (ids: string[]) =>
  render(
    <PickEmHomeActionButtons
      selectedCategoriesIds={ids}
      setSelectedCategories={setSelectedCategories}
      interest={Tier.MEDIUM}
      effort={Tier.LOW}
      makePick={makePick}
      setError={setError}
    />,
  );

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
    renderButtons(selectedCategoriesIds);

    expect(screen.getByRole("button", { name: "Pick" })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "View activities" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Explore" })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Add Activity" }),
    ).toBeInTheDocument();
  });

  it("disables Pick when no categories are selected", () => {
    renderButtons([]);

    expect(screen.getByRole("button", { name: "Pick" })).toBeDisabled();
  });

  it("disables View activities when no categories are selected", () => {
    renderButtons([]);

    expect(
      screen.getByRole("button", { name: "View activities" }),
    ).toBeDisabled();
  });

  it("enables Pick when categories, interest, and effort are selected", () => {
    renderButtons(selectedCategoriesIds);

    expect(screen.getByRole("button", { name: "Pick" })).toBeEnabled();
  });

  it("calls makePick when Pick is clicked", () => {
    renderButtons(selectedCategoriesIds);

    fireEvent.click(screen.getByRole("button", { name: "Pick" }));

    expect(makePick).toHaveBeenCalledOnce();
  });

  it("fetches selected categories when View activities is clicked", async () => {
    mockGetCategories.mockResolvedValue(categories);

    renderButtons(selectedCategoriesIds);

    fireEvent.click(screen.getByRole("button", { name: "View activities" }));

    await vi.waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalledOnce();
    });

    expect(mockGetCategories).toHaveBeenCalledWith(selectedCategoriesIds);

    expect(setSelectedCategories).toHaveBeenCalledOnce();
    expect(setSelectedCategories).toHaveBeenCalledWith(categories);
  });

  it("sets an error when fetching categories fails", async () => {
    mockGetCategories.mockRejectedValue(new Error("API failure"));

    renderButtons(selectedCategoriesIds);

    fireEvent.click(screen.getByRole("button", { name: "View activities" }));

    await vi.waitFor(() => {
      expect(setError).toHaveBeenCalledOnce();
    });

    expect(setError).toHaveBeenCalledWith(
      "Failed to fetch selected categories from server",
    );
  });

  it("disables Explore when no categories are selected", () => {
    renderButtons([]);

    expect(screen.getByRole("button", { name: "Explore" })).toBeDisabled();
  });

  it("disables Explore when two or more categories are selected", () => {
    renderButtons(selectedCategoriesIds);

    expect(screen.getByRole("button", { name: "Explore" })).toBeDisabled();
  });

  it("enables Explore when exactly one category is selected", () => {
    renderButtons(["movies"]);

    expect(screen.getByRole("button", { name: "Explore" })).toBeEnabled();
  });

  it("navigates to the explore page when Explore is clicked", () => {
    renderButtons(["movies"]);

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));

    expect(mockNavigate).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith("/categories/movies/explore");
    expect(mockGetCategories).not.toHaveBeenCalled();
  });

  it("navigates to the new activity page", () => {
    renderButtons([]);

    fireEvent.click(screen.getByRole("button", { name: "Add Activity" }));

    expect(mockNavigate).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith("/activities/new");
  });
});

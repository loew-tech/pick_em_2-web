import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CategorySelectForm from "../CategoriesSelectForm";
import { getCategoriesIds } from "../../../api/client";

vi.mock("../../../api/client", () => ({
  getCategoriesIds: vi.fn(),
}));

vi.mock("../../loadingSpinner/LoadingSpinner", () => ({
  default: () => <div role="progressbar">Loading...</div>,
}));

const mockGetCategoriesIds = vi.mocked(getCategoriesIds);

const categories = ["movies", "podcasts", "games"];

const onSelect = vi.fn();
const setError = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("CategorySelectForm", () => {
  it("shows the loading spinner while categories are loading", () => {
    mockGetCategoriesIds.mockReturnValue(new Promise(() => {}));

    render(<CategorySelectForm onSelect={onSelect} setError={setError} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders the categories returned by the API", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories,
    });

    render(<CategorySelectForm onSelect={onSelect} setError={setError} />);

    for (const category of categories) {
      expect(await screen.findByLabelText(category)).toBeInTheDocument();
    }
  });

  it("renders a checkbox for each category", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories,
    });

    render(<CategorySelectForm onSelect={onSelect} setError={setError} />);

    const checkboxes = await screen.findAllByRole("checkbox");

    expect(checkboxes).toHaveLength(categories.length);
  });

  it("uses the category as the checkbox name", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories,
    });

    render(<CategorySelectForm onSelect={onSelect} setError={setError} />);

    for (const category of categories) {
      expect(
        await screen.findByRole("checkbox", { name: category }),
      ).toHaveAttribute("name", category);
    }
  });

  it("calls onSelect when a category is selected", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories,
    });

    render(<CategorySelectForm onSelect={onSelect} setError={setError} />);

    const checkbox = await screen.findByRole("checkbox", {
      name: "movies",
    });

    fireEvent.click(checkbox);

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: "movies",
        }),
      }),
      true,
    );
  });

  it("calls onSelect when a category is deselected", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories,
    });

    render(<CategorySelectForm onSelect={onSelect} setError={setError} />);

    const checkbox = await screen.findByRole("checkbox", {
      name: "movies",
    });

    fireEvent.click(checkbox);
    fireEvent.click(checkbox);

    expect(onSelect).toHaveBeenCalledTimes(2);

    expect(onSelect).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        target: expect.objectContaining({
          name: "movies",
        }),
      }),
      false,
    );
  });

  it("calls setError when fetching categories fails", async () => {
    mockGetCategoriesIds.mockRejectedValue(new Error("API failure"));

    render(<CategorySelectForm onSelect={onSelect} setError={setError} />);

    // Give the rejected promise/effect time to run.
    await vi.waitFor(() => {
      expect(setError).toHaveBeenCalledOnce();
    });

    expect(setError).toHaveBeenCalledWith("Failed to fetch categories");
  });

  it("stops showing the loading spinner when fetching categories fails", async () => {
    mockGetCategoriesIds.mockRejectedValue(new Error("API failure"));

    render(<CategorySelectForm onSelect={onSelect} setError={setError} />);

    await vi.waitFor(() => {
      expect(setError).toHaveBeenCalledOnce();
    });

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});

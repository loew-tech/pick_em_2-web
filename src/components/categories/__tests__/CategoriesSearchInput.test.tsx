import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CategorySearchInput from "../CategorySearchInput";
import { getCategoriesIds } from "../../../api/client";

vi.mock("../../../api/client", () => ({
  getCategoriesIds: vi.fn(),
}));

const mockGetCategoriesIds = vi.mocked(getCategoriesIds);

const setCategory = vi.fn();
const setError = vi.fn();

const serverCategories = ["movies", "podcasts", "games"];

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("CategorySearchInput", () => {
  it("loads categories from the server", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories: serverCategories,
    });

    render(
      <CategorySearchInput setCategory={setCategory} setError={setError} />,
    );

    expect(mockGetCategoriesIds).toHaveBeenCalledOnce();

    const input = screen.getByRole("combobox");

    fireEvent.mouseDown(input);

    for (const category of serverCategories) {
      expect(
        await screen.findByRole("option", { name: category }),
      ).toBeInTheDocument();
    }
  });

  it("calls setCategory when an existing category is selected", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories: serverCategories,
    });

    render(
      <CategorySearchInput setCategory={setCategory} setError={setError} />,
    );

    const input = screen.getByRole("combobox");

    fireEvent.mouseDown(input);

    const option = await screen.findByRole("option", {
      name: "movies",
    });

    fireEvent.click(option);

    expect(setCategory).toHaveBeenCalledWith("movies");
  });

  it("calls setCategory with trimmed input", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories: serverCategories,
    });

    render(
      <CategorySearchInput setCategory={setCategory} setError={setError} />,
    );

    const input = screen.getByRole("combobox");

    fireEvent.change(input, {
      target: {
        value: "  sci-fi  ",
      },
    });

    expect(setCategory).toHaveBeenCalledWith("sci-fi");
  });

  it("adds a new category to the available options", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories: serverCategories,
    });

    render(
      <CategorySearchInput setCategory={setCategory} setError={setError} />,
    );

    const input = screen.getByRole("combobox");

    fireEvent.change(input, {
      target: {
        value: "sci-fi",
      },
    });

    fireEvent.keyDown(input, {
      key: "Enter",
    });

    await waitFor(() => {
      expect(setCategory).toHaveBeenCalledWith("sci-fi");
    });

    fireEvent.mouseDown(input);

    expect(
      await screen.findByRole("option", { name: "sci-fi" }),
    ).toBeInTheDocument();
  });

  it("does not add a duplicate category", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories: serverCategories,
    });

    render(
      <CategorySearchInput setCategory={setCategory} setError={setError} />,
    );

    const input = screen.getByRole("combobox");

    fireEvent.change(input, {
      target: {
        value: "movies",
      },
    });

    fireEvent.keyDown(input, {
      key: "Enter",
    });

    fireEvent.mouseDown(input);

    const options = await screen.findAllByRole("option", {
      name: "movies",
    });

    expect(options).toHaveLength(1);
  });

  it("does not add an empty category", async () => {
    mockGetCategoriesIds.mockResolvedValue({
      categories: serverCategories,
    });

    render(
      <CategorySearchInput setCategory={setCategory} setError={setError} />,
    );

    const input = screen.getByRole("combobox");

    fireEvent.change(input, {
      target: {
        value: "   ",
      },
    });

    fireEvent.keyDown(input, {
      key: "Enter",
    });

    fireEvent.mouseDown(input);

    expect(
      screen.queryByRole("option", { name: "   " }),
    ).not.toBeInTheDocument();
  });

  it("calls setError when categories cannot be loaded", async () => {
    mockGetCategoriesIds.mockRejectedValue(new Error("API failure"));

    render(
      <CategorySearchInput setCategory={setCategory} setError={setError} />,
    );

    await waitFor(() => {
      expect(setError).toHaveBeenCalledOnce();
    });

    expect(setError).toHaveBeenCalledWith("Failed to fetch categories");
  });
});

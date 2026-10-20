import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchAuthSession } from "aws-amplify/auth";
import { useNavigate, useParams } from "react-router-dom";

import { getCategories, removeActivity } from "../../api/client";
import { API_Error } from "../../common/errors";
import { Tier, type Activity } from "../../models/Activity";
import type { Category } from "../../models/Category";
import ExplorePage from "../explore";

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock("../../api/client", () => ({
  getCategories: vi.fn(),
  removeActivity: vi.fn(),
}));

vi.mock("../../components/loadingSpinner/LoadingSpinner", () => ({
  default: () => <div role="status">Loading</div>,
}));

const navigate = vi.fn();

const activity = (
  activity_id: string,
  name: string,
  interest: Tier,
  effort: Tier,
): Activity => ({
  activity_id,
  name,
  category: "movies",
  interest,
  effort,
});

const category: Category = {
  id: "movies",
  activities: [
    activity("1", "Alpha", Tier.LOW, Tier.LOW),
    activity("2", "Bravo", Tier.MEDIUM, Tier.MEDIUM),
    activity("3", "Charlie", Tier.HIGH, Tier.HIGH),
    activity("4", "Delta", Tier.LOW, Tier.HIGH),
  ],
};

const authenticated = () =>
  vi.mocked(fetchAuthSession).mockResolvedValue({
    tokens: { idToken: {} },
  } as Awaited<ReturnType<typeof fetchAuthSession>>);

const selectFilter = (index: number, option: string) => {
  fireEvent.mouseDown(screen.getAllByRole("combobox")[index]);
  fireEvent.click(screen.getByRole("option", { name: option }));
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useNavigate).mockReturnValue(navigate);
  vi.mocked(useParams).mockReturnValue({ categoryId: "movies" });
  authenticated();
  vi.mocked(getCategories).mockResolvedValue([category]);
  vi.mocked(removeActivity).mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe("ExplorePage", () => {
  it("shows a loading state while authentication is checked", () => {
    vi.mocked(fetchAuthSession).mockReturnValue(new Promise(() => {}));

    render(<ExplorePage />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });

  it("redirects unauthenticated users to login", async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: undefined });

    render(<ExplorePage />);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/login", { replace: true });
    });
    expect(getCategories).not.toHaveBeenCalled();
  });

  it("fetches and renders the category activities", async () => {
    render(<ExplorePage />);

    expect(await screen.findByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("Delta")).toBeInTheDocument();
    expect(getCategories).toHaveBeenCalledOnce();
    expect(getCategories).toHaveBeenCalledWith(["movies"]);
  });

  it("shows an empty message for a category with no activities", async () => {
    vi.mocked(getCategories).mockResolvedValue([
      { id: "movies", activities: [] },
    ]);

    render(<ExplorePage />);

    expect(
      await screen.findByText("This category has no activities yet."),
    ).toBeInTheDocument();
  });

  it("shows an error when the fetch fails", async () => {
    vi.mocked(getCategories).mockRejectedValue(new Error("API failure"));

    render(<ExplorePage />);

    expect(
      await screen.findByText("Failed to fetch category."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("filters by at-least interest", async () => {
    render(<ExplorePage />);

    await screen.findByText("Alpha");
    selectFilter(0, "Medium");

    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.queryByText("Delta")).not.toBeInTheDocument();
  });

  it("filters by at-most effort", async () => {
    render(<ExplorePage />);

    await screen.findByText("Alpha");
    selectFilter(1, "Medium");

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
    expect(screen.queryByText("Delta")).not.toBeInTheDocument();
  });

  it("combines interest and effort filters", async () => {
    render(<ExplorePage />);

    await screen.findByText("Alpha");
    selectFilter(0, "Medium");
    selectFilter(1, "Medium");

    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
    expect(screen.queryByText("Delta")).not.toBeInTheDocument();
  });

  it("shows a no-match message when filters exclude everything", async () => {
    render(<ExplorePage />);

    await screen.findByText("Alpha");
    selectFilter(0, "High");
    selectFilter(1, "Low");

    expect(
      screen.getByText("No activities match these filters."),
    ).toBeInTheDocument();
  });

  it("restores the full list when a filter returns to All", async () => {
    render(<ExplorePage />);

    await screen.findByText("Alpha");
    selectFilter(0, "Medium");
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();

    selectFilter(0, "All");

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Delta")).toBeInTheDocument();
  });

  it("deletes an activity and removes it from the list", async () => {
    render(<ExplorePage />);

    await screen.findByText("Alpha");
    fireEvent.click(screen.getByRole("button", { name: "Delete Bravo" }));

    expect(removeActivity).toHaveBeenCalledOnce();
    expect(removeActivity).toHaveBeenCalledWith("2", category.activities[1]);

    expect(await screen.findByText("DELETE Bravo succeeded!")).toBeInTheDocument();
    expect(screen.queryByText("Bravo")).not.toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalledWith(
      "/categories/movies/activities/2",
    );
  });

  it("keeps the activity and shows an error when delete fails", async () => {
    vi.mocked(removeActivity).mockRejectedValue(new API_Error(500));

    render(<ExplorePage />);

    await screen.findByText("Alpha");
    fireEvent.click(screen.getByRole("button", { name: "Delete Bravo" }));

    expect(
      await screen.findByText(
        "DELETE activity failed with error message API request failed: 500",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(
      screen.queryByText("DELETE Bravo succeeded!"),
    ).not.toBeInTheDocument();
  });

  it("disables the delete button while the delete is pending", async () => {
    let resolveDelete: () => void = () => {};
    vi.mocked(removeActivity).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveDelete = resolve;
      }),
    );

    render(<ExplorePage />);

    await screen.findByText("Alpha");
    const deleteButton = screen.getByRole("button", { name: "Delete Bravo" });
    fireEvent.click(deleteButton);

    expect(deleteButton).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Delete Alpha" }),
    ).not.toBeDisabled();

    resolveDelete();

    expect(await screen.findByText("DELETE Bravo succeeded!")).toBeInTheDocument();
  });

  it("refreshes the list on first click of a temporary activity", async () => {
    const localCategory: Category = {
      id: "movies",
      activities: [activity("local-1", "Echo", Tier.LOW, Tier.LOW)],
    };
    const refreshedCategory: Category = {
      id: "movies",
      activities: [activity("5", "Echo", Tier.LOW, Tier.LOW)],
    };

    vi.mocked(getCategories)
      .mockResolvedValueOnce([localCategory])
      .mockResolvedValue([refreshedCategory]);

    render(<ExplorePage />);

    await screen.findByText("Echo");
    expect(
      screen.queryByRole("button", { name: "Delete Echo" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));

    expect(await screen.findByText("List refreshed.")).toBeInTheDocument();
    expect(getCategories).toHaveBeenCalledTimes(2);
    expect(getCategories).toHaveBeenLastCalledWith(["movies"]);
    expect(
      screen.getByRole("button", { name: "Delete Echo" }),
    ).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalledWith(
      "/categories/movies/activities/local-1",
    );
  });

  it("shows a loading spinner while refreshing a temporary activity", async () => {
    const localCategory: Category = {
      id: "movies",
      activities: [activity("local-1", "Echo", Tier.LOW, Tier.LOW)],
    };
    const refreshedCategory: Category = {
      id: "movies",
      activities: [activity("5", "Echo", Tier.LOW, Tier.LOW)],
    };

    let resolveRefresh: (categories: Category[]) => void = () => {};
    vi.mocked(getCategories)
      .mockResolvedValueOnce([localCategory])
      .mockReturnValue(
        new Promise<Category[]>((resolve) => {
          resolveRefresh = resolve;
        }),
      );

    render(<ExplorePage />);

    await screen.findByText("Echo");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("status")).toHaveTextContent("Loading");

    resolveRefresh([refreshedCategory]);

    expect(await screen.findByText("List refreshed.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps the list and shows an error when the refresh fails", async () => {
    const localCategory: Category = {
      id: "movies",
      activities: [activity("local-1", "Echo", Tier.LOW, Tier.LOW)],
    };

    vi.mocked(getCategories)
      .mockResolvedValueOnce([localCategory])
      .mockRejectedValue(new Error("API failure"));

    render(<ExplorePage />);

    await screen.findByText("Echo");
    fireEvent.click(screen.getByRole("button"));

    expect(
      await screen.findByText("Failed to refresh activities."),
    ).toBeInTheDocument();
    expect(screen.getByText("Echo")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete Echo" }),
    ).not.toBeInTheDocument();
  });

  it("provides a link back to home", async () => {
    render(<ExplorePage />);

    await screen.findByText("Alpha");
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

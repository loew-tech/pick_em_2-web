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

import { getCategories } from "../../api/client";
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

  it("provides a link back to home", async () => {
    render(<ExplorePage />);

    await screen.findByText("Alpha");
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

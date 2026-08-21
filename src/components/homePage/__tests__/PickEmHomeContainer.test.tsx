import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PickEmHomeContainer from "../PickEmHomeContainer";
import { getPick } from "../../../api/client";
import { Tier } from "../../../models/Activity";
import type { Category } from "../../../models/Category";
import type { Pick } from "../../../models/Pick";

import { INTEREST, EFFORT } from "../../../common/constants";

vi.mock("../../../api/client", () => ({
  getPick: vi.fn(),
}));

vi.mock("../../categories/CategoriesSelectForm", () => ({
  default: ({
    onSelect,
  }: {
    onSelect: (
      event: React.ChangeEvent<HTMLInputElement>,
      checked: boolean,
    ) => void;
  }) => (
    <div>
      <label>
        Movies
        <input
          type="checkbox"
          name="movies"
          onChange={(event) => onSelect(event, event.target.checked)}
        />
      </label>

      <label>
        Podcasts
        <input
          type="checkbox"
          name="podcasts"
          onChange={(event) => onSelect(event, event.target.checked)}
        />
      </label>
    </div>
  ),
}));

vi.mock("../../activity/FilterDropdown", () => ({
  FilterDropdown: ({
    title,
    handleChange,
    value,
  }: {
    title: string;
    handleChange: (tier: Tier) => void;
    value: Tier;
  }) => (
    <select
      aria-label={title}
      value={value}
      onChange={(event) => handleChange(Number(event.target.value) as Tier)}
    >
      <option value={Tier.LOW}>Low</option>
      <option value={Tier.MEDIUM}>Medium</option>
      <option value={Tier.HIGH}>High</option>
    </select>
  ),
}));

vi.mock("../../categories/CategoriesActivitiesContainer", () => ({
  default: ({ category }: { category: Category }) => (
    <div data-testid={`category-${category.id}`}>{category.id}</div>
  ),
}));

vi.mock("../../pick/PickCard", () => ({
  default: ({ pick }: { pick: Pick | null }) => (
    <div data-testid="pick-card">
      {pick ? `${pick.name} - ${pick.category}` : "No matching activity"}
    </div>
  ),
}));

vi.mock("../PickEmHomeActionsButtons", () => ({
  default: ({
    selectedCategoriesIds,
    makePick,
    setSelectedCategories,
    setError,
  }: {
    selectedCategoriesIds: string[];
    makePick: () => void;
    setSelectedCategories: (categories: Category[]) => void;
    setError: (error: string) => void;
  }) => (
    <div>
      <button onClick={makePick}>Pick!</button>

      <button
        onClick={() =>
          setSelectedCategories([
            {
              id: "movies",
              activities: [],
            },
          ])
        }
      >
        Explore!
      </button>

      <span data-testid="selected-categories">
        {selectedCategoriesIds.join(",")}
      </span>

      <button onClick={() => setError("test error")}>Set Error</button>
    </div>
  ),
}));

const mockGetPick = vi.mocked(getPick);

const setError = vi.fn();

const pick: Pick = {
  name: "Watch a movie",
  category: "movies",
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("PickEmHomeContainer", () => {
  it("renders the category and filter sections", () => {
    render(<PickEmHomeContainer setError={setError} />);

    expect(
      screen.getByRole("heading", {
        name: "What are you interested in?",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "How are you feeling?",
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(INTEREST)).toBeInTheDocument();
    expect(screen.getByLabelText(EFFORT)).toBeInTheDocument();
  });

  it("tracks selected categories", () => {
    render(<PickEmHomeContainer setError={setError} />);

    const movies = screen.getByRole("checkbox", {
      name: "Movies",
    });

    fireEvent.click(movies);

    expect(screen.getByTestId("selected-categories")).toHaveTextContent(
      "movies",
    );
  });

  it("removes a category when it is unchecked", () => {
    render(<PickEmHomeContainer setError={setError} />);

    const movies = screen.getByRole("checkbox", {
      name: "Movies",
    });

    fireEvent.click(movies);
    fireEvent.click(movies);

    expect(screen.getByTestId("selected-categories")).toHaveTextContent("");
  });

  it("updates the interest tier", () => {
    render(<PickEmHomeContainer setError={setError} />);

    fireEvent.change(screen.getByLabelText(INTEREST), {
      target: {
        value: Tier.HIGH,
      },
    });

    expect(screen.getByLabelText(INTEREST)).toHaveValue(String(Tier.HIGH));
  });

  it("updates the effort tier", () => {
    render(<PickEmHomeContainer setError={setError} />);

    fireEvent.change(screen.getByLabelText(EFFORT), {
      target: {
        value: Tier.MEDIUM,
      },
    });

    expect(screen.getByLabelText(EFFORT)).toHaveValue(String(Tier.MEDIUM));
  });

  it("makes a pick using the selected categories and filters", async () => {
    mockGetPick.mockResolvedValue(pick);

    render(<PickEmHomeContainer setError={setError} />);

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Movies",
      }),
    );

    fireEvent.change(screen.getByLabelText(INTEREST), {
      target: {
        value: Tier.HIGH,
      },
    });

    fireEvent.change(screen.getByLabelText(EFFORT), {
      target: {
        value: Tier.MEDIUM,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Pick!" }));

    await waitFor(() => {
      expect(mockGetPick).toHaveBeenCalledOnce();
    });

    expect(mockGetPick).toHaveBeenCalledWith(
      ["movies"],
      Tier.HIGH,
      Tier.MEDIUM,
    );

    expect(screen.getByTestId("pick-card")).toHaveTextContent(
      "Watch a movie - movies",
    );
  });

  it("renders the PickCard when no matching activity is found", async () => {
    mockGetPick.mockResolvedValue(null);

    render(<PickEmHomeContainer setError={setError} />);

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Movies",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Pick!" }));

    await waitFor(() => {
      expect(screen.getByTestId("pick-card")).toHaveTextContent(
        "No matching activity",
      );
    });
  });

  it("sets an error when making a pick fails", async () => {
    mockGetPick.mockRejectedValue(new Error("API failure"));

    render(<PickEmHomeContainer setError={setError} />);

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Movies",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Pick!" }));

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith("Failed to make pick.");
    });
  });

  it("renders selected categories after exploring", async () => {
    render(<PickEmHomeContainer setError={setError} />);

    fireEvent.click(screen.getByRole("button", { name: "Explore!" }));

    expect(await screen.findByTestId("category-movies")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Your activities",
      }),
    ).toBeInTheDocument();
  });
});

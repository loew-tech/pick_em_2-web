import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNavigate } from "react-router-dom";

import ActivityCard from "../ActivityCard";
import { Tier, type Activity } from "../../../models/Activity";
import { EFFORT, INTEREST } from "../../../common/constants";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();

const activity: Activity = {
  activity_id: "activity-1",
  category: "movies",
  name: "Watch a movie",
  interest: Tier.MEDIUM,
  effort: Tier.LOW,
};

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useNavigate).mockReturnValue(
    mockNavigate as ReturnType<typeof useNavigate>,
  );
});

afterEach(() => {
  cleanup();
});

describe("ActivityCard", () => {
  it("renders the activity name", () => {
    render(<ActivityCard activity={activity} />);

    expect(
      screen.getByRole("heading", { name: activity.name }),
    ).toBeInTheDocument();
  });

  it("renders the interest and effort", () => {
    render(<ActivityCard activity={activity} />);

    expect(screen.getByText(`${INTEREST}: MEDIUM`)).toBeInTheDocument();

    expect(screen.getByText(`${EFFORT}: LOW`)).toBeInTheDocument();
  });

  it("applies the correct interest tier class", () => {
    render(<ActivityCard activity={activity} />);

    expect(screen.getByText(`${INTEREST}: MEDIUM`)).toHaveClass(
      "activity-card__tag--interest-medium",
    );
  });

  it("applies the correct effort tier class", () => {
    render(<ActivityCard activity={activity} />);

    expect(screen.getByText(`${EFFORT}: LOW`)).toHaveClass(
      "activity-card__tag--effort-low",
    );
  });

  it.each([
    [Tier.LOW, "low"],
    [Tier.MEDIUM, "medium"],
    [Tier.HIGH, "high"],
  ])("applies the %s interest class", (tier, expectedClass) => {
    render(
      <ActivityCard
        activity={{
          ...activity,
          interest: tier,
        }}
      />,
    );

    expect(screen.getByText(new RegExp(`^${INTEREST}:`))).toHaveClass(
      `activity-card__tag--interest-${expectedClass}`,
    );
  });

  it.each([
    [Tier.LOW, "low"],
    [Tier.MEDIUM, "medium"],
    [Tier.HIGH, "high"],
  ])("applies the %s effort class", (tier, expectedClass) => {
    render(
      <ActivityCard
        activity={{
          ...activity,
          effort: tier,
        }}
      />,
    );

    expect(screen.getByText(new RegExp(`^${EFFORT}:`))).toHaveClass(
      `activity-card__tag--effort-${expectedClass}`,
    );
  });

  it("navigates to the activity when clicked", () => {
    render(<ActivityCard activity={activity} />);

    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith(
      "/categories/movies/activities/activity-1",
    );
  });
});

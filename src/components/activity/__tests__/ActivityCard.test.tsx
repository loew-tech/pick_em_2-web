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

    expect(
      screen.getByText(`${INTEREST.toUpperCase()}: MEDIUM`),
    ).toBeInTheDocument();

    expect(
      screen.getByText(`${EFFORT.toUpperCase()}: LOW`),
    ).toBeInTheDocument();
  });

  it("applies the activity card class", () => {
    render(<ActivityCard activity={activity} />);

    expect(
      screen.getByRole("button").querySelector(".activity-card"),
    ).toBeInTheDocument();
  });

  it("applies the button class", () => {
    render(<ActivityCard activity={activity} />);

    expect(screen.getByRole("button")).toHaveClass("activity-card-button");
  });

  it("applies the correct interest tier class", () => {
    render(<ActivityCard activity={activity} />);

    expect(screen.getByText(`${INTEREST.toUpperCase()}: MEDIUM`)).toHaveClass(
      "activity-card__tag--interest-medium",
    );
  });

  it("applies the correct effort tier class", () => {
    render(<ActivityCard activity={activity} />);

    expect(screen.getByText(`${EFFORT.toUpperCase()}: LOW`)).toHaveClass(
      "activity-card__tag--effort-low",
    );
  });

  it.each([
    [Tier.LOW, "LOW", "low"],
    [Tier.MEDIUM, "MEDIUM", "medium"],
    [Tier.HIGH, "HIGH", "high"],
  ])("applies the %s interest class", (tier, label, expectedClass) => {
    render(
      <ActivityCard
        activity={{
          ...activity,
          interest: tier,
        }}
      />,
    );

    expect(
      screen.getByText(new RegExp(`^${INTEREST.toUpperCase()}: ${label}$`)),
    ).toHaveClass(`activity-card__tag--interest-${expectedClass}`);
  });

  it.each([
    [Tier.LOW, "LOW", "low"],
    [Tier.MEDIUM, "MEDIUM", "medium"],
    [Tier.HIGH, "HIGH", "high"],
  ])("applies the %s effort class", (tier, label, expectedClass) => {
    render(
      <ActivityCard
        activity={{
          ...activity,
          effort: tier,
        }}
      />,
    );

    expect(
      screen.getByText(new RegExp(`^${EFFORT.toUpperCase()}: ${label}$`)),
    ).toHaveClass(`activity-card__tag--effort-${expectedClass}`);
  });

  it("navigates to the activity when clicked", () => {
    render(<ActivityCard activity={activity} />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockNavigate).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith(
      "/categories/movies/activities/activity-1",
    );
  });
});

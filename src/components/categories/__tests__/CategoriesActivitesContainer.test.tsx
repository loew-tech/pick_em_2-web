import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Activity } from "../../../models/Activity";
import type { Category } from "../../../models/Category";

import CategoriesActivitiesContainer from "../CategoriesActivitiesContainer";

vi.mock("../../activity/ActivityCard", () => ({
  default: ({ activity }: { activity: Activity }) => (
    <div data-testid="activity-card">{activity.name}</div>
  ),
}));

const activities: Activity[] = [
  {
    activity_id: "activity-1",
    category: "movies",
    name: "Watch a movie",
    interest: 3,
    effort: 1,
  },
  {
    activity_id: "activity-2",
    category: "movies",
    name: "Go to the theater",
    interest: 1,
    effort: 3,
  },
];

const category: Category = {
  id: "movies",
  activities,
};

afterEach(() => {
  cleanup();
});

describe("CategoriesActivitiesContainer", () => {
  it("renders the category name", () => {
    render(<CategoriesActivitiesContainer category={category} />);

    expect(
      screen.getByRole("heading", { name: category.id }),
    ).toBeInTheDocument();
  });

  it("renders an activity card for each activity", () => {
    render(<CategoriesActivitiesContainer category={category} />);

    expect(screen.getAllByTestId("activity-card")).toHaveLength(
      activities.length,
    );
  });

  it("renders each activity", () => {
    render(<CategoriesActivitiesContainer category={category} />);

    for (const activity of activities) {
      expect(screen.getByText(activity.name)).toBeInTheDocument();
    }
  });

  it("renders no activity cards when the category has no activities", () => {
    render(
      <CategoriesActivitiesContainer
        category={{
          ...category,
          activities: [],
        }}
      />,
    );

    expect(screen.queryAllByTestId("activity-card")).toHaveLength(0);
  });

  it("renders the category as a section", () => {
    render(<CategoriesActivitiesContainer category={category} />);

    expect(
      screen.getByRole("heading", { name: category.id }).closest("section"),
    ).toBeInTheDocument();
  });

  it("applies the category container class", () => {
    render(<CategoriesActivitiesContainer category={category} />);

    expect(
      screen.getByRole("heading", { name: category.id }).closest("section"),
    ).toHaveClass("category-activities");
  });

  it("applies the category title class", () => {
    render(<CategoriesActivitiesContainer category={category} />);

    expect(screen.getByRole("heading", { name: category.id })).toHaveClass(
      "category-activities__title",
    );
  });
});

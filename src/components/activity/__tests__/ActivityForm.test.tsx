import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ActivityForm from "../ActivityForm";
import { Tier, type ActivityData } from "../../../models/Activity";

const activity: ActivityData = {
  category: "movies",
  name: "Watch a movie",
  interest: Tier.MEDIUM,
  effort: Tier.LOW,
};

const emptyActivity: ActivityData = {
  category: "",
  name: "",
  interest: Tier.LOW,
  effort: Tier.LOW,
};

const createProps = (
  overrides: Partial<React.ComponentProps<typeof ActivityForm>> = {},
) => ({
  activity,
  isNew: false,
  deleteSucceeded: false,
  setError: vi.fn(),
  onSubmit: vi.fn(),
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
  onCategoryChange: vi.fn(),
  onInterestChange: vi.fn(),
  onEffortChange: vi.fn(),
  onNameChange: vi.fn(),
  ...overrides,
});

afterEach(() => {
  cleanup();
});

describe("ActivityForm", () => {
  describe("existing activity", () => {
    it("renders the category", () => {
      render(<ActivityForm {...createProps()} />);

      expect(
        screen.getByRole("heading", {
          name: `CATEGORY: ${activity.category}`,
        }),
      ).toBeInTheDocument();
    });

    it("renders the activity name", () => {
      render(<ActivityForm {...createProps()} />);

      expect(
        screen.getByRole("heading", {
          name: `ACTIVITY: ${activity.name}`,
        }),
      ).toBeInTheDocument();
    });

    it("renders the UPDATE button", () => {
      render(<ActivityForm {...createProps()} />);

      expect(
        screen.getByRole("button", { name: "UPDATE" }),
      ).toBeInTheDocument();
    });

    it("renders the DELETE button", () => {
      render(<ActivityForm {...createProps()} />);

      expect(
        screen.getByRole("button", { name: "DELETE" }),
      ).toBeInTheDocument();
    });

    it("calls onUpdate when UPDATE is clicked", () => {
      const onUpdate = vi.fn();

      render(
        <ActivityForm
          {...createProps({
            onUpdate,
          })}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "UPDATE" }));

      expect(onUpdate).toHaveBeenCalledOnce();
    });

    it("calls onRemove when DELETE is clicked", () => {
      const onRemove = vi.fn();

      render(
        <ActivityForm
          {...createProps({
            onRemove,
          })}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "DELETE" }));

      expect(onRemove).toHaveBeenCalledOnce();
    });
  });

  describe("new activity", () => {
    it("renders the activity name input", () => {
      render(
        <ActivityForm
          {...createProps({
            activity: emptyActivity,
            isNew: true,
          })}
        />,
      );

      expect(
        screen.getByPlaceholderText("Enter Activity Name"),
      ).toBeInTheDocument();
    });

    it("renders the ADD button", () => {
      render(
        <ActivityForm
          {...createProps({
            activity,
            isNew: true,
          })}
        />,
      );

      expect(screen.getByRole("button", { name: "ADD" })).toBeInTheDocument();
    });

    it("disables ADD when the category is missing", () => {
      render(
        <ActivityForm
          {...createProps({
            activity: {
              ...activity,
              category: "",
            },
            isNew: true,
          })}
        />,
      );

      expect(screen.getByRole("button", { name: "ADD" })).toBeDisabled();
    });

    it("disables ADD when the name is missing", () => {
      render(
        <ActivityForm
          {...createProps({
            activity: {
              ...activity,
              name: "",
            },
            isNew: true,
          })}
        />,
      );

      expect(screen.getByRole("button", { name: "ADD" })).toBeDisabled();
    });

    it("enables ADD when category and name are provided", () => {
      render(
        <ActivityForm
          {...createProps({
            activity,
            isNew: true,
          })}
        />,
      );

      expect(screen.getByRole("button", { name: "ADD" })).toBeEnabled();
    });
  });

  describe("delete succeeded", () => {
    it("hides the action buttons", () => {
      render(
        <ActivityForm
          {...createProps({
            deleteSucceeded: true,
          })}
        />,
      );

      expect(
        screen.queryByRole("button", { name: "UPDATE" }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("button", { name: "DELETE" }),
      ).not.toBeInTheDocument();
    });
  });
});

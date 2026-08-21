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

import {
  addActivity,
  getActivity,
  removeActivity,
  updateActivity,
} from "../../api/client";
import { API_Error, ClientArgumentError } from "../../common/errors";
import { Tier, type ActivityData } from "../../models/Activity";
import ActivityPage from "../activity";

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
  addActivity: vi.fn(),
  getActivity: vi.fn(),
  removeActivity: vi.fn(),
  updateActivity: vi.fn(),
}));

vi.mock("../../components/loadingSpinner/LoadingSpinner", () => ({
  default: () => <div role="status">Loading</div>,
}));

vi.mock("../../components/activity/ActivityForm", () => ({
  default: (props: {
    activity: ActivityData;
    isNew: boolean;
    deleteSucceeded: boolean;
    setError: (error: string) => void;
    onSubmit: React.SubmitEventHandler<HTMLFormElement>;
    onUpdate: () => void;
    onRemove: () => void;
    onCategoryChange: (category: string) => void;
    onInterestChange: (tier: Tier) => void;
    onEffortChange: (tier: Tier) => void;
    onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <form onSubmit={props.onSubmit}>
      <div data-testid="activity-data">{JSON.stringify(props.activity)}</div>
      <div data-testid="is-new">{String(props.isNew)}</div>
      <div data-testid="delete-succeeded">{String(props.deleteSucceeded)}</div>
      <button type="button" onClick={() => props.onCategoryChange("books")}>
        Set category
      </button>
      <input aria-label="Activity name" onChange={props.onNameChange} />
      <button type="button" onClick={() => props.onInterestChange(Tier.HIGH)}>
        Set interest
      </button>
      <button type="button" onClick={() => props.onEffortChange(Tier.HIGH)}>
        Set effort
      </button>
      <button type="submit">ADD</button>
      <button type="button" onClick={props.onUpdate}>
        UPDATE
      </button>
      <button type="button" onClick={props.onRemove}>
        DELETE
      </button>
    </form>
  ),
}));

const navigate = vi.fn();
const existingActivity: ActivityData = {
  name: "Read a book",
  category: "books",
  interest: Tier.MEDIUM,
  effort: Tier.LOW,
};

const authenticated = () =>
  vi.mocked(fetchAuthSession).mockResolvedValue({
    tokens: { idToken: {} },
  } as Awaited<ReturnType<typeof fetchAuthSession>>);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useNavigate).mockReturnValue(navigate);
  vi.mocked(useParams).mockReturnValue({});
  authenticated();
  vi.mocked(addActivity).mockResolvedValue(existingActivity as never);
  vi.mocked(getActivity).mockResolvedValue(existingActivity as never);
  vi.mocked(removeActivity).mockResolvedValue(undefined as never);
  vi.mocked(updateActivity).mockResolvedValue(existingActivity as never);
});

afterEach(() => {
  cleanup();
});

describe("ActivityPage", () => {
  it("shows a loading state while authentication is checked", () => {
    vi.mocked(fetchAuthSession).mockReturnValue(new Promise(() => {}));

    render(<ActivityPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });

  it("redirects unauthenticated users to login", async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: undefined });

    render(<ActivityPage />);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/login", { replace: true });
    });
  });

  it("renders the add form when route ids are absent", async () => {
    render(<ActivityPage />);

    expect(
      await screen.findByRole("button", { name: "ADD" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Add Activity" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("is-new")).toHaveTextContent("true");
    expect(getActivity).not.toHaveBeenCalled();
  });

  it("loads and renders an existing activity", async () => {
    vi.mocked(useParams).mockReturnValue({ categoryId: "1", activityId: "2" });

    render(<ActivityPage />);

    expect(
      await screen.findByRole("button", { name: "UPDATE" }),
    ).toBeInTheDocument();
    expect(getActivity).toHaveBeenCalledWith("1", "2");
    expect(
      screen.getByRole("heading", { name: "Edit Activity" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("activity-data")).toHaveTextContent(
      existingActivity.name,
    );
  });

  it("updates fields and adds a new activity", async () => {
    render(<ActivityPage />);

    await screen.findByRole("button", { name: "ADD" });
    fireEvent.click(screen.getByRole("button", { name: "Set category" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Activity name" }), {
      target: { value: "Read a book" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "ADD" }).closest("form")!,
    );

    await waitFor(() => {
      expect(addActivity).toHaveBeenCalledWith({
        ...existingActivity,
        interest: Tier.LOW,
      });
    });
    expect(
      await screen.findByText("ADD Read a book succeeded!"),
    ).toBeInTheDocument();
  });

  it("rejects add when category or name is missing", async () => {
    render(<ActivityPage />);

    await screen.findByRole("button", { name: "ADD" });
    fireEvent.submit(
      screen.getByRole("button", { name: "ADD" }).closest("form")!,
    );

    expect(
      await screen.findByText("category and name must be provided."),
    ).toBeInTheDocument();
    expect(addActivity).not.toHaveBeenCalled();
  });

  it("updates and deletes an existing activity", async () => {
    vi.mocked(useParams).mockReturnValue({ categoryId: "1", activityId: "2" });
    render(<ActivityPage />);

    await screen.findByRole("button", { name: "UPDATE" });
    fireEvent.click(screen.getByRole("button", { name: "UPDATE" }));
    await waitFor(() => {
      expect(updateActivity).toHaveBeenCalledWith("2", existingActivity);
    });
    expect(
      await screen.findByText("UPDATE Read a book succeeded!"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "DELETE" }));
    await waitFor(() => {
      expect(removeActivity).toHaveBeenCalledWith("2", existingActivity);
    });
    expect(screen.getByTestId("delete-succeeded")).toHaveTextContent("true");
  });

  it("shows API and client errors from actions", async () => {
    vi.mocked(useParams).mockReturnValue({ categoryId: "1", activityId: "2" });
    vi.mocked(updateActivity).mockRejectedValueOnce(new API_Error(500));
    render(<ActivityPage />);

    await screen.findByRole("button", { name: "UPDATE" });
    fireEvent.click(screen.getByRole("button", { name: "UPDATE" }));
    expect(
      await screen.findByText(
        "UPDATE activity failed with error message API request failed: 500",
      ),
    ).toBeInTheDocument();

    vi.mocked(updateActivity).mockRejectedValueOnce(
      new ClientArgumentError("bad id"),
    );
    fireEvent.click(screen.getByRole("button", { name: "UPDATE" }));
    expect(
      await screen.findByText(
        "UPDATE activity failed. Invalid arguments provided. Invalid argument provided for bad id",
      ),
    ).toBeInTheDocument();
  });

  it("provides a link back to home", async () => {
    render(<ActivityPage />);

    await screen.findByRole("button", { name: "ADD" });
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute(
      "href",
      "/home",
    );
  });
});

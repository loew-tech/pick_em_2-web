import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession, signOut } from "aws-amplify/auth";

import Home from "../home";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../../components/homePage/PickEmHomeContainer", () => ({
  default: ({ setError }: { setError: (error: string) => void }) => (
    <div>
      <div>PickEmHomeContainer</div>
      <button onClick={() => setError("Home container error")}>
        Set Error
      </button>
    </div>
  ),
}));

vi.mock("../../components/loadingSpinner/LoadingSpinner", () => ({
  default: () => <div>Loading...</div>,
}));

const mockNavigate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useNavigate).mockReturnValue(mockNavigate);

  vi.mocked(fetchAuthSession).mockResolvedValue({
    tokens: {
      idToken: {},
    },
  } as Awaited<ReturnType<typeof fetchAuthSession>>);

  vi.mocked(signOut).mockResolvedValue(
    undefined as Awaited<ReturnType<typeof signOut>>,
  );
});

afterEach(() => {
  cleanup();
});

describe("Home", () => {
  it("shows the loading spinner while authentication is checked", () => {
    let resolveAuth!: (
      value: Awaited<ReturnType<typeof fetchAuthSession>>,
    ) => void;

    const authPromise = new Promise<
      Awaited<ReturnType<typeof fetchAuthSession>>
    >((resolve) => {
      resolveAuth = resolve;
    });

    vi.mocked(fetchAuthSession).mockReturnValue(authPromise);

    render(<Home />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    resolveAuth({
      tokens: {
        idToken: {},
      },
    } as Awaited<ReturnType<typeof fetchAuthSession>>);
  });

  it("renders the home page after authentication succeeds", async () => {
    render(<Home />);

    expect(
      await screen.findByRole("heading", { name: "Pick'em" }),
    ).toBeInTheDocument();

    expect(screen.getByText("PickEmHomeContainer")).toBeInTheDocument();
  });

  it("redirects to login when there is no ID token", async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({
      tokens: undefined,
    } as Awaited<ReturnType<typeof fetchAuthSession>>);

    render(<Home />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        replace: true,
      });
    });

    expect(screen.queryByText("PickEmHomeContainer")).not.toBeInTheDocument();
  });

  it("redirects to login when authentication fails", async () => {
    vi.mocked(fetchAuthSession).mockRejectedValue(
      new Error("Authentication failed"),
    );

    render(<Home />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        replace: true,
      });
    });

    expect(screen.queryByText("PickEmHomeContainer")).not.toBeInTheDocument();
  });

  it("signs out and redirects to login", async () => {
    render(<Home />);

    await screen.findByRole("heading", { name: "Pick'em" });

    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce();
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        replace: true,
      });
    });
  });

  it("displays an error when sign out fails", async () => {
    vi.mocked(signOut).mockRejectedValue(new Error("Sign out failed"));

    render(<Home />);

    await screen.findByRole("heading", { name: "Pick'em" });

    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));

    expect(await screen.findByText("Unable to sign out.")).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays errors passed from PickEmHomeContainer", async () => {
    render(<Home />);

    await screen.findByRole("heading", { name: "Pick'em" });

    fireEvent.click(screen.getByRole("button", { name: "Set Error" }));

    expect(await screen.findByText("Home container error")).toBeInTheDocument();
  });
});

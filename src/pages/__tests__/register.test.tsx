import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Register from "../register";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../components/auth/RegistrationForm", () => ({
  default: ({
    setUsername,
    setEmail,
    setNeedsConfirmation,
    setError,
  }: {
    setUsername: (username: string) => void;
    setEmail: (email: string) => void;
    setNeedsConfirmation: (value: boolean) => void;
    setError: (error: string) => void;
  }) => (
    <div>
      <div>Registration Form</div>

      <button onClick={() => setUsername("testuser")}>Set Username</button>

      <button onClick={() => setEmail("test@example.com")}>Set Email</button>

      <button onClick={() => setNeedsConfirmation(true)}>
        Confirm Registration
      </button>

      <button onClick={() => setError("Registration failed.")}>
        Set Error
      </button>
    </div>
  ),
}));

vi.mock("../../components/auth/RegistrationConfirmationForm", () => ({
  default: ({
    username,
    email,
    setError,
    setNeedsConfirmation,
  }: {
    username: string;
    email: string;
    setError: (error: string) => void;
    setNeedsConfirmation: (value: boolean) => void;
  }) => (
    <div>
      <div>Registration Confirmation Form</div>
      <div>Username: {username}</div>
      <div>Email: {email}</div>

      <button onClick={() => setNeedsConfirmation(false)}>
        Back to Registration
      </button>

      <button onClick={() => setError("Invalid confirmation code.")}>
        Set Error
      </button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("Register", () => {
  it("renders the registration form by default", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    expect(screen.getByText("Registration Form")).toBeInTheDocument();
    expect(
      screen.queryByText("Registration Confirmation Form"),
    ).not.toBeInTheDocument();
  });

  it("renders the sign-in link", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", {
        name: "Already Registered? Sign In.",
      }),
    ).toHaveAttribute("href", "/login");
  });

  it("switches to the confirmation form", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm Registration",
      }),
    );

    expect(
      screen.getByText("Registration Confirmation Form"),
    ).toBeInTheDocument();

    expect(screen.queryByText("Registration Form")).not.toBeInTheDocument();
  });

  it("preserves username and email when switching to confirmation", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Set Username",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Set Email",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm Registration",
      }),
    );

    expect(screen.getByText("Username: testuser")).toBeInTheDocument();
    expect(screen.getByText("Email: test@example.com")).toBeInTheDocument();
  });

  it("displays an error", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Set Error",
      }),
    );

    expect(
      screen.getByRole("alert", {
        name: "",
      }),
    ).toHaveTextContent("Registration failed.");
  });

  it("clears the registration form when returning from confirmation", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm Registration",
      }),
    );

    expect(
      screen.getByText("Registration Confirmation Form"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Back to Registration",
      }),
    );

    expect(screen.getByText("Registration Form")).toBeInTheDocument();
    expect(
      screen.queryByText("Registration Confirmation Form"),
    ).not.toBeInTheDocument();
  });

  it("displays errors from the confirmation form", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm Registration",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Set Error",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid confirmation code.",
    );
  });
});

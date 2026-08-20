import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNavigate } from "react-router-dom";
import { confirmSignUp } from "aws-amplify/auth";

import RegistrationConfirmationForm from "../RegistrationConfirmationForm";

vi.mock("aws-amplify/auth", () => ({
  confirmSignUp: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();
const mockConfirmSignUp = vi.mocked(confirmSignUp);

const mockSetError = vi.fn();
const mockSetNeedsConfirmation = vi.fn();

const username = "steve";
const email = "steve@example.com";

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useNavigate).mockReturnValue(
    mockNavigate as ReturnType<typeof useNavigate>,
  );

  mockConfirmSignUp.mockResolvedValue({
    isSignUpComplete: true,
    nextStep: {
      signUpStep: "DONE",
    },
  });
});

afterEach(() => {
  cleanup();
});

describe("RegistrationConfirmationForm", () => {
  it("renders the confirmation heading", () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Confirm Your Account" }),
    ).toBeInTheDocument();
  });

  it("renders the email address", () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === `A confirmation code was sent to ${email}.`,
      ),
    ).toBeInTheDocument();
  });

  it("renders the confirmation code input", () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    expect(
      screen.getByRole("textbox", { name: "Confirmation Code" }),
    ).toBeInTheDocument();
  });

  it("configures the confirmation code input for one-time codes", () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Confirmation Code",
    });

    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
  });

  it("disables the confirm button when no code is entered", () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Confirm Account" }),
    ).toBeDisabled();
  });

  it("enables the confirm button when a code is entered", () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Confirmation Code",
    });

    fireEvent.change(input, {
      target: { value: "123456" },
    });

    expect(
      screen.getByRole("button", { name: "Confirm Account" }),
    ).toBeEnabled();
  });

  it("updates the confirmation code when entered", () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Confirmation Code",
    });

    fireEvent.change(input, {
      target: { value: "123456" },
    });

    expect(input).toHaveValue("123456");
  });

  it("clears the error before confirming", async () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "Confirmation Code" }),
      {
        target: { value: "123456" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm Account" }));

    expect(mockSetError).toHaveBeenCalledWith("");
  });

  it("confirms the account with the username and confirmation code", async () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "Confirmation Code" }),
      {
        target: { value: "123456" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm Account" }));

    await vi.waitFor(() => {
      expect(mockConfirmSignUp).toHaveBeenCalledOnce();
    });

    expect(mockConfirmSignUp).toHaveBeenCalledWith({
      username,
      confirmationCode: "123456",
    });
  });

  it("navigates to login after successful confirmation", async () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "Confirmation Code" }),
      {
        target: { value: "123456" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm Account" }));

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("sets an error when confirmation fails", async () => {
    mockConfirmSignUp.mockRejectedValueOnce(new Error("Invalid code"));

    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "Confirmation Code" }),
      {
        target: { value: "wrong-code" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm Account" }));

    await vi.waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith("Invalid confirmation code.");
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("returns to registration", () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Back to registration" }),
    );

    expect(mockSetNeedsConfirmation).toHaveBeenCalledWith(false);
    expect(mockSetError).toHaveBeenCalledWith("");
  });

  it("clears the confirmation code when returning to registration", () => {
    render(
      <RegistrationConfirmationForm
        username={username}
        email={email}
        setError={mockSetError}
        setNeedsConfirmation={mockSetNeedsConfirmation}
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Confirmation Code",
    });

    fireEvent.change(input, {
      target: { value: "123456" },
    });

    expect(input).toHaveValue("123456");

    fireEvent.click(
      screen.getByRole("button", { name: "Back to registration" }),
    );

    expect(input).toHaveValue("");
  });
});

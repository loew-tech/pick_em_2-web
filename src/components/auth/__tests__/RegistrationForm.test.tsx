import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signUp } from "aws-amplify/auth";

import RegistrationForm from "../RegistrationForm";

vi.mock("aws-amplify/auth", () => ({
  signUp: vi.fn(),
}));

const mockSignUp = vi.mocked(signUp);

const mockSetUsername = vi.fn();
const mockSetEmail = vi.fn();
const mockSetNeedsConfirmation = vi.fn();
const mockSetError = vi.fn();

const username = "steve";
const email = "steve@example.com";
const password = "password123";

beforeEach(() => {
  vi.clearAllMocks();

  mockSignUp.mockResolvedValue({
    isSignUpComplete: false,
    nextStep: {
      signUpStep: "CONFIRM_SIGN_UP",
      codeDeliveryDetails: {
        deliveryMedium: "EMAIL",
        destination: email,
      },
    },
  });
});

afterEach(() => {
  cleanup();
});

describe("RegistrationForm", () => {
  it("renders the heading", () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Create Account" }),
    ).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    expect(screen.getByText("Create your Pick'em account")).toBeInTheDocument();
  });

  it("renders the username field", () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Username" })).toHaveValue(
      username,
    );
  });

  it("renders the password field", () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    const passwordInput = screen.getByLabelText(
      /^Password/,
    ) as HTMLInputElement;

    expect(passwordInput.type).toBe("password");
  });

  it("renders the email field", () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue(email);
  });

  it("calls setUsername when the username changes", () => {
    render(
      <RegistrationForm
        username=""
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Username" }), {
      target: { value: username },
    });

    expect(mockSetUsername).toHaveBeenCalledWith(username);
  });

  it("calls setEmail when the email changes", () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email=""
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: email },
    });

    expect(mockSetEmail).toHaveBeenCalledWith(email);
  });

  it("updates the password value", () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    const passwordInput = screen.getByLabelText(/^Password/);

    fireEvent.change(passwordInput, {
      target: { value: password },
    });

    expect(passwordInput).toHaveValue(password);
  });

  it("disables Register when required fields are empty", () => {
    render(
      <RegistrationForm
        username=""
        setUsername={mockSetUsername}
        email=""
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    expect(screen.getByRole("button", { name: "Register" })).toBeDisabled();
  });

  it("disables Register when the password is empty", () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    expect(screen.getByRole("button", { name: "Register" })).toBeDisabled();
  });

  it("enables Register when all fields have values", () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^Password/), {
      target: { value: password },
    });

    expect(screen.getByRole("button", { name: "Register" })).toBeEnabled();
  });

  it("clears the error before registering", async () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^Password/), {
      target: { value: password },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(mockSetError).toHaveBeenCalledWith("");
  });

  it("calls signUp with the registration details", async () => {
    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^Password/), {
      target: { value: password },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await vi.waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledOnce();
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      username,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });
  });

  it("requires confirmation when signUp requires confirmation", async () => {
    mockSignUp.mockResolvedValueOnce({
      isSignUpComplete: false,
      nextStep: {
        signUpStep: "CONFIRM_SIGN_UP",
        codeDeliveryDetails: {
          deliveryMedium: "EMAIL",
          destination: email,
          attributeName: "email",
        },
      },
    });

    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^Password/), {
      target: { value: password },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await vi.waitFor(() => {
      expect(mockSetNeedsConfirmation).toHaveBeenCalledWith(true);
    });
  });

  it("does not require confirmation when signUp is complete", async () => {
    mockSignUp.mockResolvedValueOnce({
      isSignUpComplete: true,
      nextStep: {
        signUpStep: "DONE",
      },
    });

    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^Password/), {
      target: { value: password },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await vi.waitFor(() => {
      expect(mockSetNeedsConfirmation).toHaveBeenCalledWith(false);
    });
  });

  it("sets an error when registration fails", async () => {
    mockSignUp.mockRejectedValueOnce(new Error("Registration failed"));

    render(
      <RegistrationForm
        username={username}
        setUsername={mockSetUsername}
        email={email}
        setEmail={mockSetEmail}
        setNeedsConfirmation={mockSetNeedsConfirmation}
        setError={mockSetError}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^Password/), {
      target: { value: password },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await vi.waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith("Registration failed.");
    });

    expect(mockSetNeedsConfirmation).not.toHaveBeenCalled();
  });
});

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { confirmSignUp } from "aws-amplify/auth";
import { Box, Button, Link, Stack, TextField, Typography } from "@mui/material";

import "./RegistrationConfirmationForm.scss";

interface RegistrationConfirmationFormProps {
  username: string;
  email: string;
  setError: (error: string) => void;
  setNeedsConfirmation: (needsConfirmation: boolean) => void;
}

const RegistrationConfirmationForm = ({
  username,
  email,
  setError,
  setNeedsConfirmation,
}: RegistrationConfirmationFormProps) => {
  const navigate = useNavigate();

  const [confirmationCode, setConfirmationCode] = useState("");

  const handleConfirm = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await confirmSignUp({
        username,
        confirmationCode,
      });

      navigate("/login");
    } catch (err) {
      console.log(err);
      setError("Invalid confirmation code.");
    }
  };

  return (
    <Stack className="confirmation-form" spacing={3}>
      <Box className="confirmation-form__header">
        <Typography
          className="confirmation-form__title"
          variant="h4"
          component="h1"
        >
          Confirm Your Account
        </Typography>

        <Typography
          className="confirmation-form__description"
          color="text.secondary"
        >
          A confirmation code was sent to <strong>{email}</strong>.
        </Typography>
      </Box>

      <Box
        className="confirmation-form__form"
        component="form"
        onSubmit={handleConfirm}
      >
        <Stack spacing={3}>
          <TextField
            label="Confirmation Code"
            value={confirmationCode}
            onChange={(event) => setConfirmationCode(event.target.value)}
            required
            fullWidth
            autoFocus
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                autoComplete: "one-time-code",
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={!confirmationCode}
          >
            Confirm Account
          </Button>
        </Stack>
      </Box>

      <Link
        className="confirmation-form__back"
        component="button"
        type="button"
        onClick={() => {
          setNeedsConfirmation(false);
          setConfirmationCode("");
          setError("");
        }}
      >
        Back to registration
      </Link>
    </Stack>
  );
};

export default RegistrationConfirmationForm;

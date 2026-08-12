import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { confirmSignUp } from "aws-amplify/auth";
import { Box, Button, Link, Stack, TextField, Typography } from "@mui/material";

type RegistrationConfirmationFormProps = {
  username: string;
  email: string;
  setError: (error: string) => void;
  setNeedsConfirmation: (needsConfirmation: boolean) => void;
};
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
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Confirm Your Account
        </Typography>

        <Typography color="text.secondary">
          A confirmation code was sent to {email}.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleConfirm}>
        <Stack spacing={3}>
          <TextField
            label="Confirmation Code"
            value={confirmationCode}
            onChange={(event) => setConfirmationCode(event.target.value)}
            required
            fullWidth
            autoFocus
          />

          <Button type="submit" variant="contained" size="large" fullWidth>
            Confirm Account
          </Button>
        </Stack>
      </Box>

      <Link
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

import { useState } from "react";

import { signUp } from "aws-amplify/auth";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

interface RegistrationFormProps {
  username: string;
  setUsername: (username: string) => void;
  email: string;
  setEmail: (email: string) => void;
  setNeedsConfirmation: (needsConfirmation: boolean) => void;
  setError: (error: string) => void;
}
const RegistrationForm = ({
  username,
  setUsername,
  email,
  setEmail,
  setNeedsConfirmation,
  setError,
}: RegistrationFormProps) => {
  const [password, setPassword] = useState("");

  const handleRegister = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const result = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });

      setNeedsConfirmation(result.nextStep.signUpStep === "CONFIRM_SIGN_UP");
    } catch (err) {
      console.log(err);
      setError("Registration failed.");
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Account
        </Typography>

        <Typography color="text.secondary">
          Create your Pick&apos;em account
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleRegister}>
        <Stack spacing={3}>
          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            fullWidth
            autoComplete="username"
            autoFocus
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
            autoComplete="new-password"
          />

          <TextField
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
            autoComplete="email"
          />

          <Button type="submit" variant="contained" size="large" fullWidth>
            Register
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};
export default RegistrationForm;

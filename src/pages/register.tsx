import { useState } from "react";

import { Alert, Box, Container, Link, Paper } from "@mui/material";

import RegistrationConfirmationForm from "../components/auth/RegistrationConfirmationForm";
import RegistrationForm from "../components/auth/RegistrationForm";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState("");

  return (
    <Box component="main">
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {needsConfirmation ? (
            <RegistrationConfirmationForm
              username={username}
              email={email}
              setError={setError}
              setNeedsConfirmation={setNeedsConfirmation}
            />
          ) : (
            <RegistrationForm
              username={username}
              setUsername={setUsername}
              email={email}
              setEmail={setEmail}
              setError={setError}
              setNeedsConfirmation={setNeedsConfirmation}
            />
          )}
          <Link href="/login">Already Registered? Sign In.</Link>
        </Paper>
      </Container>
    </Box>
  );
};
export default Register;

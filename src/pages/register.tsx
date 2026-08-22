import { useState } from "react";

import { Alert, Box, Container, Link, Paper } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import RegistrationConfirmationForm from "../components/auth/RegistrationConfirmationForm";
import RegistrationForm from "../components/auth/RegistrationForm";

import "./Register.scss";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState("");

  return (
    <Box component="main" className="register">
      <Container maxWidth="sm">
        <Paper className="register__card" elevation={3}>
          {error && (
            <Alert className="register__error" severity="error">
              {error}
            </Alert>
          )}

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

          <Box className="register__login-link">
            <Link component={RouterLink} to="/login">
              Already Registered? Sign In.
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;

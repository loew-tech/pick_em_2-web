import { useEffect, useState } from "react";

import { fetchAuthSession, signIn, signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const { tokens } = await fetchAuthSession();

        if (tokens?.idToken) {
          navigate("/home", { replace: true });
        }
      } catch {
        // No authenticated session; remain on the login page.
      }
    }

    void checkAuthentication();
  }, [navigate]);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const result = await signIn({
        username,
        password,
      });

      // TODO: remove debug print
      console.log("sign-in-result", result);
      navigate("/home");
    } catch (err) {
      console.log(err);
      setError("Invalid username or password");
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Box component="main">
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Pick&apos;em
              </Typography>

              <Typography color="text.secondary">
                Log in to your account.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
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
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                >
                  Log In
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" sx={{ textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link
                component="button"
                type="button"
                onClick={() => navigate("/register")}
              >
                Register
              </Link>
            </Typography>

            {/* TODO: remove once testing and auth work is done */}
            <Button type="button" variant="outlined" onClick={handleSignOut}>
              Sign Out
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

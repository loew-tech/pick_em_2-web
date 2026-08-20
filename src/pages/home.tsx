import { useEffect, useState } from "react";

import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Typography } from "@mui/material";

import PickEmHomeContainer from "../components/homePage/PickEmHomeContainer";

const Home = () => {
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const { tokens } = await fetchAuthSession();

        if (!tokens?.idToken) {
          navigate("/login", { replace: true });
        }
      } catch {
        navigate("/login");
      }
    }

    void checkAuthentication();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      setError("Unable to sign out.");
    }
  };

  return (
    <Box component="main">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Pick&apos;em
        </Typography>

        <Button onClick={handleSignOut}>Sign Out</Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      <PickEmHomeContainer setError={setError} />
    </Box>
  );
};
export default Home;

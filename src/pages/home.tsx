import { useEffect, useState } from "react";

import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Typography } from "@mui/material";

import PickEmHomeContainer from "../components/homePage/PickEmHomeContainer";
import LoadingSpinner from "../components/loadingSpinner/LoadingSpinner";

import "./Home.scss";

const Home = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const { tokens } = await fetchAuthSession();

        if (!tokens?.idToken) {
          navigate("/login", { replace: true });
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate("/login", { replace: true });
      }
    };

    void checkAuthentication();
  }, [navigate]);

  const handleSignOut = async () => {
    setError("");

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Unable to sign out.");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box component="main" className="home">
      <Box className="home__header">
        <Typography variant="h4" component="h1">
          Pick&apos;em
        </Typography>

        <Button onClick={handleSignOut}>Sign Out</Button>
      </Box>

      {error && (
        <Alert className="home__error" severity="error">
          {error}
        </Alert>
      )}

      <PickEmHomeContainer setError={setError} />
    </Box>
  );
};

export default Home;

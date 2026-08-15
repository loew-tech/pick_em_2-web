import { useState } from "react";
import { Alert, Box, Typography } from "@mui/material";

import PickEmHomeContainer from "../homePage/PickEmHomeContainer";

const Home = () => {
  const [error, setError] = useState<string>("");

  return (
    <Box component="main">
      <Typography variant="h4" component="h1" gutterBottom>
        Pick'em
        {error && <Alert severity="error">{error}</Alert>}
      </Typography>
      <PickEmHomeContainer setError={setError} />
    </Box>
  );
};
export default Home;

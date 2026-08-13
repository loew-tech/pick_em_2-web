import { useState } from "react";
import type { Activity } from "../models/Activity";
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CategorySearchInput from "../components/categories/CategorySearchInput";

enum ACTIONS {
  UPDATE,
  REMOVE,
  ADD,
  CANCEL,
}

interface ActivityProps {
  activity: Activity | null;
}
const ActivityPage = ({ activity }: ActivityProps) => {
  const [category, setCategory] = useState(activity ? activity.category : "");
  const [name, setName] = useState(activity ? activity.name : "");
  const [interest, setInterest] = useState(activity ? activity.interest : "");
  const [effort, setEffort] = useState(activity ? activity.effort : "");
  const [error, setError] = useState("");

  const handleConfirm = () => {};

  return (
    <Box component="main">
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Add or Edit Activity
          </Typography>
          <Link href="/home">Back to Home</Link>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack spacing={3}>
            <Box component="form" onSubmit={handleConfirm}>
              <CategorySearchInput
                setCategory={setCategory}
                setError={setError}
              />
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
export default ActivityPage;

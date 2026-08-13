import { useState, type ChangeEvent, type ReactNode } from "react";

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

import type { Activity } from "../models/Activity";
import CategorySearchInput from "../components/categories/CategorySearchInput";
import { FilterDropdown } from "../components/activity/FilterDropdown";
import { useNavigate } from "react-router-dom";
import { addActivity, removeActivity, updateActivity } from "../api/client";

const ACTIONS = {
  UPDATE: 0,
  REMOVE: 1,
  ADD: 2,
  CANCEL: 3,
} as const;
type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

interface ActivityProps {
  activity: Activity | null;
}
const ActivityPage = ({ activity }: ActivityProps) => {
  const navigate = useNavigate();

  const [category, setCategory] = useState(activity ? activity.category : "");
  const [name, setName] = useState(activity ? activity.name : "");
  const [interest, setInterest] = useState(activity ? activity.interest : "");
  const [effort, setEffort] = useState(activity ? activity.effort : "");
  const [error, setError] = useState("");

  const handleNameChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setName(event.target.value);
  };

  const handleInterestChange = (
    event:
      | ChangeEvent<Omit<HTMLInputElement, "value"> & { value: string }>
      | (Event & { target: { value: string; name: string } }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: ReactNode,
  ) => {
    setInterest(event.target.value);
  };

  const handleEffortChange = (
    event:
      | ChangeEvent<Omit<HTMLInputElement, "value"> & { value: string }>
      | (Event & { target: { value: string; name: string } }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: ReactNode,
  ) => {
    setEffort(event.target.value);
  };

  const takeEditAction = async (action: Action) => {
    if (action === ACTIONS.CANCEL) {
      navigate("/home");
    }
    if (!category || !name || !interest || !effort) {
      return;
    }

    const activity_: Activity = {
      activity_id: activity?.activity_id ?? null,
      name,
      category,
      interest,
      effort,
    };

    let ok = false;
    let errAction = "";
    switch (action) {
      case ACTIONS.UPDATE:
        ok = await updateActivity(activity_);
        errAction = "update";
        break;
      case ACTIONS.REMOVE:
        ok = await removeActivity(activity_);
        errAction = "remove";
        break;
      case ACTIONS.ADD:
        ok = await addActivity(activity_);
        errAction = "add";
        break;
    }

    if (!ok) {
      setError(`Failed Action: ${errAction}`);
      return;
    }
  };

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
              {activity ? (
                <Typography variant="h6" component="h3">
                  {activity.category}
                </Typography>
              ) : (
                <CategorySearchInput
                  setCategory={setCategory}
                  setError={setError}
                />
              )}
              <TextField
                id="outlined-basic"
                placeholder={activity?.name ?? "enter name"}
                onChange={handleNameChange}
              ></TextField>
              <FilterDropdown
                title="interest"
                handleChange={handleInterestChange}
                initVal={activity?.interest}
              />
              <FilterDropdown
                title="effort"
                handleChange={handleEffortChange}
                initVal={activity?.effort}
              />
              {activity ? (
                <>
                  <Button onClick={() => takeEditAction(ACTIONS.REMOVE)}>
                    REMOVE
                  </Button>
                  <Button onClick={() => takeEditAction(ACTIONS.UPDATE)}>
                    UPDATE
                  </Button>
                </>
              ) : (
                <Button
                  disabled={!category || !name || !interest || !effort}
                  onClick={() => takeEditAction(ACTIONS.ADD)}
                >
                  ADD
                </Button>
              )}
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
export default ActivityPage;

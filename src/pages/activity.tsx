import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

import { Tier, type Activity } from "../models/Activity";
import CategorySearchInput from "../components/categories/CategorySearchInput";
import { FilterDropdown } from "../components/activity/FilterDropdown";
import {
  addActivity,
  getActivity,
  removeActivity,
  updateActivity,
} from "../api/client";
import { CATEGORY, EFFORT, INTEREST, NAME } from "../common/constants";

const NULL_ACTIVITY: Activity = {
  name: "",
  category: "",
  activity_id: "",
  interest: Tier.LOW,
  effort: Tier.LOW,
};

const ACTIONS = {
  UPDATE: 0,
  REMOVE: 1,
  ADD: 2,
  CANCEL: 3,
} as const;
type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

const ActivityPage = () => {
  const navigate = useNavigate();
  const { categoryId, activityId } = useParams();

  const [activity, setActivity] = useState<Activity>(NULL_ACTIVITY);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      if (!categoryId || !activityId) {
        setActivity({ ...NULL_ACTIVITY });
        setIsNew(true);
      } else {
        setIsNew(false);
        try {
          const activity_ = await getActivity(categoryId, activityId);
          setActivity(activity_);
        } catch (err) {
          console.log(err);
          setError("Failed to fetch activity.");
        }
      }
    };

    fetchCategories();
  }, [activityId, categoryId]);

  const handleNameChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setActivityField(NAME, event.target.value);
  };

  const handleCategoryChange = (cat: string) => {
    setActivityField(CATEGORY, cat);
  };

  const handleInterestChange = (tier: Tier) => {
    setActivityField(INTEREST, tier);
  };

  const handleEffortChange = (tier: Tier) => {
    setActivityField(EFFORT, tier);
  };

  const setActivityField = <K extends keyof Activity>(
    field: K,
    value: Activity[K],
  ) => {
    setActivity((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // @TODO: reset page on successful add and add feedback
  const takeEditAction = async (action: Action) => {
    if (action === ACTIONS.CANCEL) {
      navigate("/home");
      return;
    }

    if (!activity) {
      setError("categor must be provided.");
      return;
    }

    if (!activity.category || !activity.name) {
      setError("category, name, interest, and effort must all be provided.");
      return;
    }

    let ok = false;
    let errAction = "";
    switch (action) {
      case ACTIONS.UPDATE:
        ok = await updateActivity(activity);
        errAction = "update";
        break;
      case ACTIONS.REMOVE:
        ok = await removeActivity(activity);
        errAction = "remove";
        break;
      case ACTIONS.ADD:
        ok = await addActivity(activity);
        errAction = "add";
        break;
    }

    if (!ok) {
      setError(`Failed Action: ${errAction}`);
      return;
    }
  };

  const handleConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void takeEditAction(ACTIONS.ADD);
  };

  return (
    <Box component="main">
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isNew ? "Add Activity" : "Edit Activity"}
          </Typography>
          <Link href="/home">Back to Home</Link>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack spacing={3}>
            <Box
              component="form"
              onSubmit={handleConfirm}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {!isNew ? (
                <Typography variant="h6" component="h3">
                  {activity.category}
                </Typography>
              ) : (
                <CategorySearchInput
                  setCategory={handleCategoryChange}
                  setError={setError}
                />
              )}
              <TextField
                id="outlined-basic"
                placeholder={activity?.name ?? "Enter Activity Name"}
                value={!isNew ? activity.name : null}
                onChange={handleNameChange}
              ></TextField>
              <FilterDropdown
                title={INTEREST}
                handleChange={handleInterestChange}
                value={activity?.interest}
              />
              <FilterDropdown
                title={EFFORT}
                handleChange={handleEffortChange}
                value={activity?.effort}
              />
              {activityId && categoryId ? (
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
                  type="submit"
                  disabled={!activity?.category || !activity?.name}
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

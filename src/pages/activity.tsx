import { useState, useEffect, type ChangeEvent } from "react";

import { fetchAuthSession } from "aws-amplify/auth";
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
import { API_Error, ClientArgumentError } from "../common/errors";

const NULL_ACTIVITY: Activity = {
  name: "",
  category: "",
  activity_id: "",
  interest: Tier.LOW,
  effort: Tier.LOW,
};

const ACTIONS = {
  UPDATE: "UPDATE",
  REMOVE: "REMOVE",
  ADD: "ADD",
  CANCEL: "CANCEL",
} as const;
type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

const ActivityPage = () => {
  const { categoryId, activityId } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState<Activity>({ ...NULL_ACTIVITY });
  const [isNew, setIsNew] = useState(false);
  const [deleteSucceeded, setDeleteSucceeded] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const reset = () => {
    setActivity({ ...NULL_ACTIVITY, category: activity.category });
    setError("");
  };

  const takeEditAction = async (action: Action) => {
    if (action === ACTIONS.CANCEL) {
      navigate("/home");
      return;
    }

    if (!activity.category || !activity.name) {
      setError("category and name must be provided.");
      return;
    }

    try {
      switch (action) {
        case ACTIONS.UPDATE:
          await updateActivity(activity);
          break;
        case ACTIONS.REMOVE:
          await removeActivity(activity);
          setDeleteSucceeded(true);
          break;
        case ACTIONS.ADD:
          if (!activity.category || !activity.name) {
            setError("category and name must be provided.");
            return;
          }
          await addActivity(activity);
          reset();
          break;
      }
      setMessage(`${action} ${activity.name} succeeded!`);
    } catch (err) {
      console.log(err);
      if (err instanceof ClientArgumentError) {
        setError(
          `${action} activity failed. Invalid arguments provided. ${err.message}`,
        );
      } else if (err instanceof API_Error) {
        setError(`${action} activity failed with error message ${err.message}`);
      } else {
        setError("Unknown error occured.");
      }
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
          {error && (
            <Alert severity="error" sx={{ marginBottom: "1rem" }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="info" sx={{ marginBottom: "1rem" }}>
              {message}
            </Alert>
          )}
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
                <>
                  <Typography variant="h6" component="h3">
                    CATEGORY: {activity.category}
                  </Typography>
                  <Typography variant="h6" component="h4">
                    ACTIVITY: {activity.name}
                  </Typography>
                </>
              ) : (
                <>
                  <CategorySearchInput
                    setCategory={handleCategoryChange}
                    setError={setError}
                  />
                  <TextField
                    id="outlined-basic"
                    placeholder={"Enter Activity Name"}
                    value={activity.name}
                    onChange={handleNameChange}
                  />
                </>
              )}
              {!deleteSucceeded ? (
                <>
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
                      <Button onClick={() => takeEditAction(ACTIONS.UPDATE)}>
                        UPDATE
                      </Button>
                      <Button onClick={() => takeEditAction(ACTIONS.REMOVE)}>
                        REMOVE
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
                </>
              ) : null}
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
export default ActivityPage;

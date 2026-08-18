import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { fetchAuthSession } from "aws-amplify/auth";
import { useNavigate, useParams } from "react-router-dom";

import { Alert, Box, Container, Link, Paper, Typography } from "@mui/material";

import { Tier, type Activity } from "../models/Activity";
import ActivityForm from "../components/activity/ActivityForm";
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
  DELETE: "DELETE",
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
        navigate("/login", { replace: true });
      }
    }

    void checkAuthentication();
  }, [navigate]);

  useEffect(() => {
    async function fetchActivity() {
      if (!categoryId || !activityId) {
        setActivity({ ...NULL_ACTIVITY });
        setIsNew(true);
        return;
      }

      setIsNew(false);

      try {
        const activity = await getActivity(categoryId, activityId);
        setActivity(activity);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch activity.");
      }
    }

    void fetchActivity();
  }, [activityId, categoryId]);

  const setActivityField = <K extends keyof Activity>(
    field: K,
    value: Activity[K],
  ) => {
    setActivity((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleNameChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setActivityField(NAME, event.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setActivityField(CATEGORY, category);
  };

  const handleInterestChange = (interest: Tier) => {
    setActivityField(INTEREST, interest);
  };

  const handleEffortChange = (effort: Tier) => {
    setActivityField(EFFORT, effort);
  };

  const reset = () => {
    setActivity({
      ...NULL_ACTIVITY,
      category: activity.category,
    });
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

        case ACTIONS.DELETE:
          await removeActivity(activity);
          setDeleteSucceeded(true);
          break;

        case ACTIONS.ADD:
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
        setError("Unknown error occurred.");
      }
    }
  };

  const handleConfirm = (event: FormEvent<HTMLFormElement>) => {
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
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <ActivityForm
            activity={activity}
            isNew={isNew}
            deleteSucceeded={deleteSucceeded}
            setError={setError}
            onSubmit={handleConfirm}
            onUpdate={() => void takeEditAction(ACTIONS.UPDATE)}
            onRemove={() => void takeEditAction(ACTIONS.DELETE)}
            onCategoryChange={handleCategoryChange}
            onInterestChange={handleInterestChange}
            onEffortChange={handleEffortChange}
            onNameChange={handleNameChange}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default ActivityPage;

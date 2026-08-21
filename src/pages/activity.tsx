import { useEffect, useState, type ChangeEvent } from "react";

import { fetchAuthSession } from "aws-amplify/auth";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { Alert, Box, Container, Link, Paper, Typography } from "@mui/material";

import { Tier, type ActivityData } from "../models/Activity";
import ActivityForm from "../components/activity/ActivityForm";
import {
  addActivity,
  getActivity,
  removeActivity,
  updateActivity,
} from "../api/client";
import { CATEGORY, EFFORT, INTEREST, NAME } from "../common/constants";
import { API_Error, ClientArgumentError } from "../common/errors";
import LoadingSpinner from "../components/loadingSpinner/LoadingSpinner";

import "./activity.scss";

const NULL_ACTIVITY: ActivityData = {
  name: "",
  category: "",
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

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<ActivityData>({
    ...NULL_ACTIVITY,
  });
  const [isNew, setIsNew] = useState(false);
  const [deleteSucceeded, setDeleteSucceeded] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      try {
        const { tokens } = await fetchAuthSession();

        if (!tokens?.idToken) {
          navigate("/login", { replace: true });
          return;
        }
      } catch {
        navigate("/login", { replace: true });
        return;
      }

      if (!categoryId || !activityId) {
        setActivity({ ...NULL_ACTIVITY });
        setIsNew(true);
        setLoading(false);
        return;
      }

      setIsNew(false);

      try {
        const activity = await getActivity(categoryId, activityId);
        setActivity(activity);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch activity.");
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, [activityId, categoryId, navigate]);

  const setActivityField = <K extends keyof ActivityData>(
    field: K,
    value: ActivityData[K],
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

  const handleActionError = (action: Action, err: unknown) => {
    console.error(err);

    if (err instanceof ClientArgumentError) {
      setError(
        `${action} activity failed. Invalid arguments provided. ${err.message}`,
      );
    } else if (err instanceof API_Error) {
      setError(`${action} activity failed with error message ${err.message}`);
    } else {
      setError("Unknown error occurred.");
    }
  };

  const handleAction = async (action: Action) => {
    if (action === ACTIONS.CANCEL) {
      navigate("/home");
      return;
    }

    if (!activity.category || !activity.name) {
      setError("category and name must be provided.");
      return;
    }

    if (action === ACTIONS.ADD) {
      try {
        await addActivity(activity);
        reset();
        setMessage(`${action} ${activity.name} succeeded!`);
      } catch (err) {
        handleActionError(action, err);
      }

      return;
    }

    if (!activityId) {
      setError(`${action} activity failed. Activity ID is required.`);
      return;
    }

    try {
      switch (action) {
        case ACTIONS.UPDATE:
          await updateActivity(activityId, activity);
          break;

        case ACTIONS.DELETE:
          await removeActivity(activityId, activity);
          setDeleteSucceeded(true);
          break;
      }

      setMessage(`${action} ${activity.name} succeeded!`);
    } catch (err) {
      handleActionError(action, err);
    }
  };

  const handleConfirm: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void handleAction(ACTIONS.ADD);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box component="main" className="activity-page">
      <Container maxWidth="sm">
        <Paper className="activity-page__card" elevation={0}>
          <Box className="activity-page__header">
            <Typography
              variant="h4"
              component="h1"
              className="activity-page__title"
            >
              {isNew ? "Add Activity" : "Edit Activity"}
            </Typography>

            <Link
              component={RouterLink}
              to="/home"
              className="activity-page__back-link"
              underline="hover"
            >
              Back to Home
            </Link>
          </Box>

          {(error || message) && (
            <Box className="activity-page__messages">
              {error && <Alert severity="error">{error}</Alert>}
              {message && <Alert severity="success">{message}</Alert>}
            </Box>
          )}

          <ActivityForm
            activity={activity}
            isNew={isNew}
            deleteSucceeded={deleteSucceeded}
            setError={setError}
            onSubmit={handleConfirm}
            onUpdate={() => void handleAction(ACTIONS.UPDATE)}
            onRemove={() => void handleAction(ACTIONS.DELETE)}
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

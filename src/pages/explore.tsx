import { useEffect, useMemo, useRef, useState } from "react";

import { fetchAuthSession } from "aws-amplify/auth";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { Alert, Box, Container, Link, Stack, Typography } from "@mui/material";

import { bulkAddActivities, getCategories, removeActivity } from "../api/client";
import { EFFORT, INTEREST } from "../common/constants";
import { API_Error, ClientArgumentError } from "../common/errors";
import CategoriesActivitiesContainer from "../components/categories/CategoriesActivitiesContainer";
import BulkAddForm from "../components/activity/BulkAddForm";
import { createBulkAddRow } from "../components/activity/bulkAddUtils";
import { FilterDropdown, FILTER_ALL, type FilterValue } from "../components/activity/FilterDropdown";
import LoadingSpinner from "../components/loadingSpinner/LoadingSpinner";
import {
  isLocalActivityId,
  Tier,
  type Activity,
  type BulkAddActivityInput,
} from "../models/Activity";
import type { Category } from "../models/Category";

import "./explore.scss";

const ExplorePage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshingTemporary, setRefreshingTemporary] = useState(false);
  const [bulkRows, setBulkRows] = useState<BulkAddActivityInput[]>([
    createBulkAddRow(),
  ]);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const localIdCounter = useRef(0);
  const [interestFilter, setInterestFilter] = useState<Tier | null>(null);
  const [effortFilter, setEffortFilter] = useState<Tier | null>(null);

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

      if (!categoryId) {
        setError("Failed to fetch category.");
        setLoading(false);
        return;
      }

      try {
        const categories = await getCategories([categoryId]);
        const fetched = categories[0];

        if (!fetched) {
          setError("Failed to fetch category.");
          return;
        }

        setCategory(fetched);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch category.");
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, [categoryId, navigate]);

  const filteredActivities = useMemo(() => {
    if (!category) {
      return [];
    }

    return category.activities.filter((activity) => {
      const interestMatches =
        interestFilter === null || activity.interest >= interestFilter;
      const effortMatches =
        effortFilter === null || activity.effort <= effortFilter;

      return interestMatches && effortMatches;
    });
  }, [category, interestFilter, effortFilter]);

  const handleInterestChange = (value: FilterValue) => {
    setInterestFilter(value === FILTER_ALL ? null : value);
  };

  const handleEffortChange = (value: FilterValue) => {
    setEffortFilter(value === FILTER_ALL ? null : value);
  };

  const handleTemporaryActivityClick = async () => {
    if (!categoryId || refreshingTemporary) {
      return;
    }

    setRefreshingTemporary(true);
    setError("");
    setMessage("");

    try {
      const categories = await getCategories([categoryId]);
      const fetched = categories[0];

      if (!fetched) {
        setError("Failed to refresh activities.");
        return;
      }

      setCategory(fetched);
      setMessage("List refreshed.");
    } catch (err) {
      console.error(err);
      setError("Failed to refresh activities.");
    } finally {
      setRefreshingTemporary(false);
    }
  };

  const handleDelete = async (activity: Activity) => {
    if (isLocalActivityId(activity.activity_id)) {
      return;
    }

    setDeletingId(activity.activity_id);
    setError("");
    setMessage("");

    try {
      await removeActivity(activity.activity_id, activity);

      setCategory((current) =>
        current
          ? {
              ...current,
              activities: current.activities.filter(
                (item) => item.activity_id !== activity.activity_id,
              ),
            }
          : current,
      );
      setMessage(`DELETE ${activity.name} succeeded!`);
    } catch (err) {
      console.error(err);

      if (err instanceof ClientArgumentError) {
        setError(
          `DELETE activity failed. Invalid arguments provided. ${err.message}`,
        );
      } else if (err instanceof API_Error) {
        setError(`DELETE activity failed with error message ${err.message}`);
      } else {
        setError("Unknown error occurred.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkAdd = async (activities: BulkAddActivityInput[]) => {
    if (!categoryId || submittingBulk) {
      return;
    }

    setSubmittingBulk(true);
    setError("");
    setMessage("");

    try {
      await bulkAddActivities(categoryId, activities);

      setCategory((current) => {
        if (!current) {
          return current;
        }

        const existingIds = new Set(
          current.activities.map((item) => item.activity_id),
        );
        const addedActivities = activities.map((item) => {
          let activityId: string;
          do {
            localIdCounter.current += 1;
            activityId = `local-${localIdCounter.current}`;
          } while (existingIds.has(activityId));

          existingIds.add(activityId);
          return { ...item, category: categoryId, activity_id: activityId };
        });

        return {
          ...current,
          activities: [...current.activities, ...addedActivities],
        };
      });
      setBulkRows([createBulkAddRow()]);
      setMessage(`Added ${activities.length} activities successfully.`);
    } catch (err) {
      console.error(err);

      if (err instanceof ClientArgumentError) {
        setError(`Bulk add failed. Invalid arguments provided. ${err.message}`);
      } else if (err instanceof API_Error) {
        setError(`Bulk add failed with error message ${err.message}`);
      } else {
        setError("Bulk add failed.");
      }
    } finally {
      setSubmittingBulk(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box component="main" className="explore-page">
      <Container maxWidth="md">
        <Box className="explore-page__header">
          <Typography
            variant="h4"
            component="h1"
            className="explore-page__title"
          >
            Explore
          </Typography>

          <Link
            component={RouterLink}
            to="/"
            className="explore-page__back-link"
            underline="hover"
          >
            Back to Home
          </Link>
        </Box>

        {error && (
          <Alert className="explore-page__error" severity="error">
            {error}
          </Alert>
        )}

        {message && (
          <Alert className="explore-page__message" severity="success">
            {message}
          </Alert>
        )}

        {category && (
          <>
            <Stack
              className="explore-page__filters"
              direction="row"
              spacing={2}
            >
              <FilterDropdown
                title={INTEREST}
                value={interestFilter ?? FILTER_ALL}
                handleChange={handleInterestChange}
                allowAll
              />

              <FilterDropdown
                title={EFFORT}
                value={effortFilter ?? FILTER_ALL}
                handleChange={handleEffortChange}
                allowAll
              />
            </Stack>

            {refreshingTemporary && <LoadingSpinner />}

            {category.activities.length === 0 ? (
              <Typography className="explore-page__empty">
                This category has no activities yet.
              </Typography>
            ) : filteredActivities.length === 0 ? (
              <Typography className="explore-page__empty">
                No activities match these filters.
              </Typography>
            ) : (
              <CategoriesActivitiesContainer
                category={{ ...category, activities: filteredActivities }}
                onDeleteActivity={(activity) => void handleDelete(activity)}
                deletingId={deletingId}
                onTemporaryActivityClick={() =>
                  void handleTemporaryActivityClick()
                }
              />
            )}

            <BulkAddForm
              rows={bulkRows}
              onRowsChange={setBulkRows}
              onSubmit={(activities) => void handleBulkAdd(activities)}
              submitting={submittingBulk}
            />
          </>
        )}
      </Container>
    </Box>
  );
};

export default ExplorePage;

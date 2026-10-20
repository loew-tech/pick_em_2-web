import { useEffect, useMemo, useState } from "react";

import { fetchAuthSession } from "aws-amplify/auth";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { Alert, Box, Container, Link, Stack, Typography } from "@mui/material";

import { getCategories } from "../api/client";
import { EFFORT, INTEREST } from "../common/constants";
import CategoriesActivitiesContainer from "../components/categories/CategoriesActivitiesContainer";
import { FilterDropdown, type FilterValue } from "../components/activity/FilterDropdown";
import LoadingSpinner from "../components/loadingSpinner/LoadingSpinner";
import { Tier } from "../models/Activity";
import type { Category } from "../models/Category";

import "./explore.scss";

const ExplorePage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");
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
    // @TODO: remove magic string here and else where
    setInterestFilter(value === "all" ? null : value);
  };

  const handleEffortChange = (value: FilterValue) => {
    setEffortFilter(value === "all" ? null : value);
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

        {category && (
          <>
            <Stack
              className="explore-page__filters"
              direction="row"
              spacing={2}
            >
              <FilterDropdown
                title={INTEREST}
                value={interestFilter ?? "all"}
                handleChange={handleInterestChange}
                allowAll
              />

              <FilterDropdown
                title={EFFORT}
                value={effortFilter ?? "all"}
                handleChange={handleEffortChange}
                allowAll
              />
            </Stack>

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
              />
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ExplorePage;

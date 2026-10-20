import { useState } from "react";
import { Alert, Box, Container, Stack, Typography } from "@mui/material";

import CategorySelectForm from "../categories/CategoriesSelectForm";
import { FilterDropdown } from "../activity/FilterDropdown";
import PickEmHomeActionButtons from "./PickEmHomeActionsButtons";
import { Tier, type Activity } from "../../models/Activity";
import type { Category } from "../../models/Category";
import type { Pick } from "../../models/Pick";
import CategoriesActivitesContainer from "../categories/CategoriesActivitiesContainer";
import PickCard from "../pick/PickCard";
import { getPick, removeActivity } from "../../api/client";
import { EFFORT, INTEREST } from "../../common/constants";
import { API_Error, ClientArgumentError } from "../../common/errors";

import "./PickEmHomeContainer.scss";

interface PickEmHomeContainerProps {
  setError: (s: string) => void;
}

const PickEmHomeContainer = ({ setError }: PickEmHomeContainerProps) => {
  const [selectedCategoriesIds, setSelectedCategoriesIds] = useState<string[]>(
    [],
  );
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [interest, setInterest] = useState<Tier>(Tier.LOW);
  const [effort, setEffort] = useState<Tier>(Tier.LOW);
  const [pick, setPick] = useState<Pick | null>(null);
  const [pickMade, setPickMade] = useState(false);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const makePick = async () => {
    setError("");

    try {
      const result = await getPick(selectedCategoriesIds, interest, effort);
      setPick(result);
      setPickMade(true);
    } catch (err) {
      console.log(err);
      setError("Failed to make pick.");
    }
  };

  const addToSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = event.target;

    setSelectedCategoriesIds((current) =>
      checked
        ? [...current, name]
        : current.filter((category) => category !== name),
    );
  };

  const handleDeleteActivity = async (activity: Activity) => {
    setDeletingId(activity.activity_id);
    setError("");
    setMessage("");

    try {
      await removeActivity(activity.activity_id, activity);

      setSelectedCategories((current) =>
        current.map((category) => ({
          ...category,
          activities: category.activities.filter(
            (item) => item.activity_id !== activity.activity_id,
          ),
        })),
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

  return (
    <Box className="pick-em-home">
      <Container maxWidth="md">
        <Box className="pick-em-home__preferences">
          <Box className="pick-em-home__categories">
            <Typography variant="h6" component="h2">
              What are you interested in?
            </Typography>

            <CategorySelectForm onSelect={addToSelection} setError={setError} />
          </Box>

          <Box className="pick-em-home__controls">
            <Box className="pick-em-home__filters">
              <Typography variant="h6" component="h2">
                How are you feeling?
              </Typography>

              <Stack spacing={2}>
                <FilterDropdown
                  title={INTEREST}
                  handleChange={setInterest}
                  value={interest}
                />

                <FilterDropdown
                  title={EFFORT}
                  handleChange={setEffort}
                  value={effort}
                />
              </Stack>
            </Box>

            <Box className="pick-em-home__actions">
              <PickEmHomeActionButtons
                selectedCategoriesIds={selectedCategoriesIds}
                setSelectedCategories={setSelectedCategories}
                interest={interest}
                effort={effort}
                makePick={makePick}
                setError={setError}
              />
            </Box>

            {pickMade && (
              <Box className="pick-em-home__result">
                <PickCard pick={pick} />
              </Box>
            )}
          </Box>
        </Box>

        {message && (
          <Alert className="pick-em-home__message" severity="success">
            {message}
          </Alert>
        )}

        {selectedCategories.length > 0 && (
          <Box className="pick-em-home__activities">
            <Typography variant="h5" component="h2">
              Your activities
            </Typography>

            <Stack spacing={2}>
              {selectedCategories.map((category) => (
                <CategoriesActivitesContainer
                  key={category.id}
                  category={category}
                  onDeleteActivity={(activity) =>
                    void handleDeleteActivity(activity)
                  }
                  deletingId={deletingId}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PickEmHomeContainer;

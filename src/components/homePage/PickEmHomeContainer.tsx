import { useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";

import CategorySelectForm from "../categories/CategoriesSelectForm";
import { FilterDropdown } from "../activity/FilterDropdown";
import PickEmHomeActionButtons from "./PickEmHomeActionsButtons";
import { Tier } from "../../models/Activity";
import type { Category } from "../../models/Category";
import type { Pick } from "../../models/Pick";
import CategoriesActivitesContainer from "../categories/CategoriesActivitesContainer";
import PickCard from "../pick/PickCard";
import { getPick } from "../../api/client";
import { EFFORT, INTEREST } from "../../common/constants";

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

  const handleInterestChange = (tier: Tier) => {
    setInterest(tier);
  };

  const handleEffortChange = (tier: Tier) => {
    setEffort(tier);
  };

  const makePick = async () => {
    setError("");

    try {
      const pick = await getPick(selectedCategoriesIds, interest, effort);
      setPick(pick);
    } catch (err) {
      console.log(err);
      setError("Failed to make pick.");
    }
  };

  const addToSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    let new_ = [...selectedCategoriesIds];

    if (event.target.checked) {
      new_.push(event.target.name);
    } else {
      new_ = new_.filter((v) => v !== event.target.name);
    }

    setSelectedCategoriesIds(new_);
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
                  handleChange={handleInterestChange}
                  value={interest}
                />

                <FilterDropdown
                  title={EFFORT}
                  handleChange={handleEffortChange}
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
            {pick && (
              <Box className="pick-em-home__result">
                <PickCard pick={pick} />
              </Box>
            )}
          </Box>
        </Box>

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

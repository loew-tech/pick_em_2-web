import { useState } from "react";
import { Container, Paper } from "@mui/material";

import CategorySelectForm from "../components/categories/CategoriesSelectForm";
import { FilterDropdown } from "../components/activity/FilterDropdown";
import PickEmHomeActionButtons from "./PickEmHomeActionsButtons";
import { Tier } from "../models/Activity";
import type { Category } from "../models/Category";
import type { Pick } from "../models/Pick";
import CategoriesActivitesContainer from "../components/categories/CategoriesActivitesContainer";
import PickCard from "../components/pick/PickCard";
import { getPick } from "../api/client";
import { EFFORT, INTEREST } from "../common/constants";

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
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <CategorySelectForm onSelect={addToSelection} setError={setError} />
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
        <PickEmHomeActionButtons
          selectedCategoriesIds={selectedCategoriesIds}
          setSelectedCategories={setSelectedCategories}
          interest={interest}
          effort={effort}
          makePick={makePick}
          setError={setError}
        />
      </Paper>
      {pick && <PickCard pick={pick} />}
      {selectedCategories.map((category) => (
        <CategoriesActivitesContainer key={category.id} category={category} />
      ))}
    </Container>
  );
};
export default PickEmHomeContainer;

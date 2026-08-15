import { useState } from "react";
import { Container, Paper } from "@mui/material";

import CategorySelectForm from "../components/categories/CategoriesSelectForm";
import { FilterDropdown } from "../components/activity/FilterDropdown";
import PickEmHomeActionButtons from "./PickEmHomeActionsButtons";
import { Tier } from "../models/Activity";

interface PickEmHomeContainerProps {
  setError: (s: string) => void;
}
const PickEmHomeContainer = ({ setError }: PickEmHomeContainerProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [interest, setInterest] = useState<Tier>(Tier.LOW);
  const [effort, setEffort] = useState<Tier>(Tier.LOW);

  const handleInterestChange = (tier: Tier) => {
    setInterest(tier);
  };

  const handleEffortChange = (tier: Tier) => {
    setEffort(tier);
  };

  const addToSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    let new_ = [...selectedCategories];
    if (event.target.checked) {
      new_.push(event.target.name);
    } else {
      new_ = new_.filter((v) => v !== event.target.name);
    }
    setSelectedCategories(new_);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <CategorySelectForm onSelect={addToSelection} setError={setError} />
        <FilterDropdown title="interest" handleChange={handleInterestChange} />
        <FilterDropdown title="effort" handleChange={handleEffortChange} />
        <PickEmHomeActionButtons
          selectedCategories={selectedCategories}
          interest={interest}
          effort={effort}
        />
      </Paper>
    </Container>
  );
};
export default PickEmHomeContainer;

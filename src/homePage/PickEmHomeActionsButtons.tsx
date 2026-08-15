import { useNavigate } from "react-router-dom";

import { Box, Button } from "@mui/material";

import type { Tier } from "../models/Activity";
import type { Category } from "../models/Category";
import { getCategories as getCategories } from "../api/client";

interface PickEmHomeActionButtonsProps {
  selectedCategoriesIds: string[];
  setSelectedCategories: (cats: Category[]) => void;
  interest: Tier;
  effort: Tier;
  makePick: () => void;
  setError: (s: string) => void;
}
const PickEmHomeActionButtons = ({
  selectedCategoriesIds,
  setSelectedCategories,
  interest,
  effort,
  makePick,
  setError,
}: PickEmHomeActionButtonsProps) => {
  const navigate = useNavigate();

  const fetchSelectedCategories = async () => {
    try {
      const categories = await getCategories(selectedCategoriesIds);
      setSelectedCategories(categories);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch categories from server");
    }
  };

  return (
    <Box className="cat-btns">
      <Button
        onClick={makePick}
        disabled={!selectedCategoriesIds.length || !interest || !effort}
      >
        Pick!
      </Button>
      <Button
        onClick={fetchSelectedCategories}
        disabled={!selectedCategoriesIds.length}
      >
        Explore!
      </Button>
      <Button onClick={() => navigate("/activity")}>Add New!</Button>
    </Box>
  );
};
export default PickEmHomeActionButtons;

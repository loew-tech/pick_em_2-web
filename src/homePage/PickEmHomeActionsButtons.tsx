import { useNavigate } from "react-router-dom";

import { Box, Button } from "@mui/material";

import type { Tier } from "../models/Activity";
import type { Category } from "../models/Category";
import { getCategories as getCategories, getPick } from "../api/client";
import type { Pick } from "../models/Pick";

interface PickEmHomeActionButtonsProps {
  selectedCategoriesIds: string[];
  setSelectedCategories: (cats: Category[]) => void;
  interest: Tier;
  effort: Tier;
  setPick: (p: Pick) => void;
  setError: (s: string) => void;
}
const PickEmHomeActionButtons = ({
  selectedCategoriesIds,
  setSelectedCategories,
  interest,
  effort,
  setPick,
  setError,
}: PickEmHomeActionButtonsProps) => {
  const navigate = useNavigate();

  const fetchPick = async () => {
    try {
      const pick = await getPick(selectedCategoriesIds);
      setPick(pick);
    } catch (err) {
      console.log(err);
      setError("Failed to make pick.");
    }
  };

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
        onClick={fetchPick}
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

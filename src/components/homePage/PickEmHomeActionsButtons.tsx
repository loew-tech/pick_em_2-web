import { useNavigate } from "react-router-dom";

import { Box, Button } from "@mui/material";

import type { Tier } from "../../models/Activity";
import type { Category } from "../../models/Category";
import { getCategories } from "../../api/client";

import "./PickEmHomeActionButtons.scss";

interface PickEmHomeActionButtonsProps {
  selectedCategoriesIds: string[];
  setSelectedCategories: (categories: Category[]) => void;
  interest: Tier;
  effort: Tier;
  makePick: () => void;
  setError: (error: string) => void;
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
    } catch {
      setError("Failed to fetch selected categories from server");
    }
  };

  const hasSelectedCategories = selectedCategoriesIds.length > 0;
  const hasExactlyOneCategory = selectedCategoriesIds.length === 1;

  const exploreSelectedCategory = () => {
    navigate(
      `/categories/${encodeURIComponent(selectedCategoriesIds[0])}/explore`,
    );
  };

  return (
    <Box className="home-actions">
      <Button
        className="home-actions__pick"
        variant="contained"
        onClick={makePick}
        disabled={!hasSelectedCategories || !interest || !effort}
      >
        Pick
      </Button>

      <Button
        variant="outlined"
        onClick={fetchSelectedCategories}
        disabled={!hasSelectedCategories}
      >
        View activities
      </Button>

      <Button
        variant="outlined"
        onClick={exploreSelectedCategory}
        disabled={!hasExactlyOneCategory}
      >
        Explore
      </Button>

      <Button variant="text" onClick={() => navigate("/activities/new")}>
        Add Activity
      </Button>
    </Box>
  );
};

export default PickEmHomeActionButtons;

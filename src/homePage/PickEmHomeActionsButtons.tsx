import { useNavigate } from "react-router-dom";

import { Box, Button } from "@mui/material";

import type { Tier } from "../models/Activity";

interface PickEmHomeActionButtonsProps {
  selectedCategories: string[];
  interest: Tier;
  effort: Tier;
}
const PickEmHomeActionButtons = ({
  selectedCategories,
  interest,
  effort,
}: PickEmHomeActionButtonsProps) => {
  const navigate = useNavigate();

  console.log("selectedCategories:", selectedCategories);

  return (
    <Box className="cat-btns">
      <Button
        onClick={() => console.log("PICK!")}
        disabled={!selectedCategories.length || !interest || !effort}
      >
        Pick!
      </Button>
      <Button
        onClick={() => console.log("EXPLORE!")}
        disabled={!selectedCategories.length}
      >
        Explore!
      </Button>
      <Button onClick={() => navigate("/activity")}>Add New!</Button>
    </Box>
  );
};
export default PickEmHomeActionButtons;

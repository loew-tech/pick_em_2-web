import { useState } from "react";
import { Box, Button, Container, Paper } from "@mui/material";

import CategorySelectForm from "../components/categories/CategoriesSelectForm";
import { useNavigate } from "react-router-dom";
import { FilterDropdown } from "../components/activity/FilterDropdown";

interface PickEmHomeContainerProps {
  setError: (s: string) => void;
}
const PickEmHomeContainer = ({ setError }: PickEmHomeContainerProps) => {
  const navigate = useNavigate();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
        <FilterDropdown title="interest" handleChange={() => {}} />
        <FilterDropdown title="effort" handleChange={() => {}} />
        <Box className="cat-btns">
          <Button onClick={() => console.log("PICK!")}>Pick!</Button>
          <Button onClick={() => console.log("EXPLORE!")}>Explore!</Button>
          <Button onClick={() => navigate("/activity")}>Add New!</Button>
        </Box>
      </Paper>
    </Container>
  );
};
export default PickEmHomeContainer;

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";

import { getCategories } from "../api/client";
import CategorySelectForm from "../components/categories/CategoriesSelectForm";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats.categories);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

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
    <Box component="main">
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Pick'em
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <CategorySelectForm
            categories={categories}
            handleChange={addToSelection}
          />
          <Button onClick={() => navigate("/activity")}>Add New!</Button>
        </Paper>
      </Container>
    </Box>
  );
};
export default Home;

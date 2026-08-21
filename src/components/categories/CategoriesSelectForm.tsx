import { useEffect, useState } from "react";

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
} from "@mui/material";

import { getCategoriesIds } from "../../api/client";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";

interface CategorySelectProps {
  onSelect: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  setError: (error: string) => void;
}

const CategorySelectForm = ({ onSelect, setError }: CategorySelectProps) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { categories } = await getCategoriesIds();
        setCategories(categories);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    void fetchCategories();
  }, [setError]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <FormControl
      className="category-select"
      component="fieldset"
      variant="standard"
    >
      <FormGroup className="category-select__group">
        {categories.map((c) => (
          <FormControlLabel
            className="category-select__option"
            key={c}
            control={<Checkbox onChange={onSelect} name={c} />}
            label={c}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
};

export default CategorySelectForm;

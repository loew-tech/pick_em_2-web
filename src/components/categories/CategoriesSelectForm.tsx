import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getCategoriesIds } from "../../api/client";
import LoadingSpinner from "../loadingSpinner/LoadingSpinner";

interface CategorySelectProps {
  onSelect: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  setError: (s: string) => void;
}
const CategorySelectForm = ({
  onSelect: handleChange,
  setError,
}: CategorySelectProps) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { categories } = await getCategoriesIds();
        console.log("cats", categories);
        setCategories(categories);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, [setError]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
      <FormGroup>
        {categories.map((c) => {
          return (
            <FormControlLabel
              key={c}
              control={<Checkbox onChange={handleChange} name={c} />}
              label={c}
            />
          );
        })}
      </FormGroup>
    </FormControl>
  );
};
export default CategorySelectForm;

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getCategories } from "../../api/client";

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
  const [categories, setCategories] = useState<string[]>([]);

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
  }, [setError]);

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

import { useEffect, useState, type SyntheticEvent } from "react";

import {
  Autocomplete,
  type AutocompleteChangeDetails,
  type AutocompleteChangeReason,
  type AutocompleteInputChangeReason,
  TextField,
} from "@mui/material";

import { getCategories } from "../../api/client";

interface CategorySearchInputProps {
  setCategory: (s: string) => void;
  setError: (s: string) => void;
}
const CategorySearchInput = ({
  setCategory,
  setError,
}: CategorySearchInputProps) => {
  const [categories, setCategories] = useState<string[]>([]);

  const handleCategoryChange = (
    _: SyntheticEvent<Element, Event>,
    value: string | null,
    reason: AutocompleteChangeReason,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    __: AutocompleteChangeDetails<string> | undefined,
  ) => {
    if (reason === "selectOption") {
      setCategory(value ?? "");
    } else if (value && !categories.includes(value)) {
      const new_ = [...categories];
      new_.push(value);
      setCategories(new_);
    }
  };

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

  const handleInputChange = (
    _: SyntheticEvent<Element, Event>,
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    __: AutocompleteInputChangeReason,
  ) => {
    setCategory(value.trim());
  };

  return (
    <Autocomplete
      id="free-solo-demo"
      freeSolo
      options={categories}
      renderInput={(params) => <TextField {...params} label="Enter Category" />}
      blurOnSelect
      onChange={handleCategoryChange}
      onInputChange={handleInputChange}
    />
  );
};
export default CategorySearchInput;

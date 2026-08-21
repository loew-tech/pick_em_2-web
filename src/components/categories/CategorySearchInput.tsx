import { useEffect, useState, type SyntheticEvent } from "react";

import {
  Autocomplete,
  type AutocompleteChangeDetails,
  type AutocompleteChangeReason,
  type AutocompleteInputChangeReason,
  TextField,
} from "@mui/material";

import { getCategoriesIds } from "../../api/client";

import "./CategoriesSelectForm.scss";

interface CategorySearchInputProps {
  setCategory: (s: string) => void;
  setError: (s: string) => void;
}

const CategorySearchInput = ({
  setCategory,
  setError,
}: CategorySearchInputProps) => {
  const [categoriesFromServer, setCategoriesFromServer] = useState<string[]>(
    [],
  );
  const [newCategories, setNewCategories] = useState<string[]>([]);

  const categories = [...categoriesFromServer, ...newCategories];

  const handleCategoryChange = (
    _: SyntheticEvent<Element, Event>,
    value: string | null,
    reason: AutocompleteChangeReason,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    __: AutocompleteChangeDetails<string> | undefined,
  ) => {
    if (reason === "selectOption") {
      setCategory(value ?? "");
      return;
    }

    if (reason === "createOption" && value) {
      const category = value.trim();

      if (
        category &&
        !categoriesFromServer.includes(category) &&
        !newCategories.includes(category)
      ) {
        setNewCategories((current) => [...current, category]);
      }

      setCategory(category);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { categories } = await getCategoriesIds();
        setCategoriesFromServer(categories);
      } catch {
        setError("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, [setError]);

  const handleInputChange = (
    _: SyntheticEvent<Element, Event>,
    value: string,
    reason: AutocompleteInputChangeReason,
  ) => {
    if (reason === "input") {
      setCategory(value.trim());
    }
  };

  return (
    <Autocomplete
      id="category-search"
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

import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type { SelectChangeEvent } from "@mui/material/Select";

import { Tier } from "../../models/Activity";

import "./FilterDropdown.scss";

export type FilterValue = Tier | "all";

type FilterDropdownProps<T extends FilterValue = Tier> = {
  title: string;
  value: T;
  handleChange: (value: T) => void;
  allowAll?: boolean;
};

export const FilterDropdown = <T extends FilterValue = Tier>({
  title,
  value,
  handleChange,
  allowAll = false,
}: FilterDropdownProps<T>) => {
  const toTitleCase = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const onChange = (event: SelectChangeEvent<T>) => {
    const raw = event.target.value;

    handleChange((raw === "all" ? "all" : Number(raw)) as T);
  };

  return (
    <FormControl
      className="filter-dropdown"
      component="fieldset"
      variant="standard"
    >
      <FormLabel className="filter-dropdown__label">
        {toTitleCase(title)}
      </FormLabel>

      <Select
        className="filter-dropdown__select"
        labelId={`${title}-select`}
        id={`${title}-select`}
        value={value}
        onChange={onChange}
      >
        {allowAll && <MenuItem value="all">All</MenuItem>}
        <MenuItem value={Tier.LOW}>Low</MenuItem>
        <MenuItem value={Tier.MEDIUM}>Medium</MenuItem>
        <MenuItem value={Tier.HIGH}>High</MenuItem>
      </Select>
    </FormControl>
  );
};

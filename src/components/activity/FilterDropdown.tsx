import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type { SelectChangeEvent } from "@mui/material/Select";

import { Tier } from "../../models/Activity";

import "./FilterDropdown.scss";

type FilterDropdownProps = {
  title: string;
  value: Tier;
  handleChange: (tier: Tier) => void;
};

export const FilterDropdown = ({
  title,
  value,
  handleChange,
}: FilterDropdownProps) => {
  const toTitleCase = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const onChange = (event: SelectChangeEvent<Tier>) => {
    const tier = Number(event.target.value) as Tier;
    handleChange(tier);
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
        <MenuItem value={Tier.LOW}>Low</MenuItem>
        <MenuItem value={Tier.MEDIUM}>Medium</MenuItem>
        <MenuItem value={Tier.HIGH}>High</MenuItem>
      </Select>
    </FormControl>
  );
};

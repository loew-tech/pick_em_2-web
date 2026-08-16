import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type { SelectChangeEvent } from "@mui/material/Select";

import { Tier } from "../../models/Activity";

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
    <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
      <FormLabel>{toTitleCase(title)}</FormLabel>

      <Select
        labelId={`${title}-select`}
        id={`${title}-select`}
        value={value}
        label={title}
        onChange={onChange}
      >
        <MenuItem value={Tier.LOW}>low</MenuItem>
        <MenuItem value={Tier.MEDIUM}>medium</MenuItem>
        <MenuItem value={Tier.HIGH}>high</MenuItem>
      </Select>
    </FormControl>
  );
};

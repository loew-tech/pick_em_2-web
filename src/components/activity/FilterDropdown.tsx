import { type ReactNode, useState } from "react";

import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { type SelectChangeEvent } from "@mui/material/Select";
import { Tier } from "../../models/Activity";

type FilterDropdownProps = {
  title: string;
  initVal?: Tier;
  handleChange: (tier: Tier) => void;
};

export const FilterDropdown = ({
  title,
  initVal,
  handleChange,
}: FilterDropdownProps) => {
  const [val, setVal] = useState<Tier>(initVal ?? 1);

  const toTitleCase = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onChange = (event: SelectChangeEvent<Tier>, _: ReactNode) => {
    const tier = Number(event.target.value) as Tier;
    setVal(tier);
    handleChange(tier);
  };

  return (
    <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
      <FormLabel>{toTitleCase(title)}</FormLabel>
      <Select
        labelId={`${title}-select`}
        id={`${title}-select`}
        value={val}
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

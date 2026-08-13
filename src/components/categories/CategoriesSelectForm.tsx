import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
} from "@mui/material";

interface CategorySelectProps {
  categories: string[];
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
}
const CategorySelectForm = ({
  categories,
  handleChange,
}: CategorySelectProps) => {
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

import type { ChangeEvent, FormEventHandler } from "react";

import { Box, Button, TextField, Typography } from "@mui/material";

import { Tier, type ActivityData } from "../../models/Activity";
import CategorySearchInput from "../categories/CategorySearchInput";
import { FilterDropdown } from "./FilterDropdown";
import { EFFORT, INTEREST } from "../../common/constants";

interface ActivityFormProps {
  activity: ActivityData;
  isNew: boolean;
  deleteSucceeded: boolean;
  setError: (error: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onUpdate: () => void;
  onRemove: () => void;
  onCategoryChange: (category: string) => void;
  onInterestChange: (tier: Tier) => void;
  onEffortChange: (tier: Tier) => void;
  onNameChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

const ActivityForm = ({
  activity,
  isNew,
  deleteSucceeded,
  setError,
  onSubmit,
  onUpdate,
  onRemove,
  onCategoryChange,
  onInterestChange,
  onEffortChange,
  onNameChange,
}: ActivityFormProps) => {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {!isNew ? (
        <>
          <Typography variant="h6" component="h2">
            CATEGORY: {activity.category}
          </Typography>

          <Typography variant="h6" component="h3">
            ACTIVITY: {activity.name}
          </Typography>
        </>
      ) : (
        <>
          <CategorySearchInput
            setCategory={onCategoryChange}
            setError={setError}
          />

          <TextField
            id="activity-name"
            placeholder="Enter Activity Name"
            value={activity.name}
            onChange={onNameChange}
          />
        </>
      )}

      {!deleteSucceeded && (
        <>
          <FilterDropdown
            title={INTEREST}
            handleChange={onInterestChange}
            value={activity.interest}
          />

          <FilterDropdown
            title={EFFORT}
            handleChange={onEffortChange}
            value={activity.effort}
          />

          {isNew ? (
            <Button
              type="submit"
              disabled={!activity.category || !activity.name}
            >
              ADD
            </Button>
          ) : (
            <>
              <Button type="button" onClick={onUpdate}>
                UPDATE
              </Button>

              <Button type="button" onClick={onRemove}>
                DELETE
              </Button>
            </>
          )}
        </>
      )}
    </Box>
  );
};
export default ActivityForm;

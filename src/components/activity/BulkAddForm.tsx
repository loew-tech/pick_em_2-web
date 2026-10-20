import type { SubmitEventHandler } from "react";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";

import { EFFORT, INTEREST } from "../../common/constants";
import type { BulkAddActivityInput } from "../../models/Activity";
import { FilterDropdown } from "./FilterDropdown";
import { createBulkAddRow } from "./bulkAddUtils";

import "./BulkAddForm.scss";

interface BulkAddFormProps {
  rows: BulkAddActivityInput[];
  onRowsChange: (rows: BulkAddActivityInput[]) => void;
  onSubmit: (activities: BulkAddActivityInput[]) => void;
  submitting?: boolean;
}

const BulkAddForm = ({
  rows,
  onRowsChange,
  onSubmit,
  submitting = false,
}: BulkAddFormProps) => {
  const canSubmit =
    rows.length > 0 && rows.every((row) => row.name.trim() !== "") && !submitting;

  const updateRow = (index: number, patch: Partial<BulkAddActivityInput>) => {
    onRowsChange(
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    onRowsChange([...rows, createBulkAddRow()]);
  };

  const removeRow = (index: number) => {
    onRowsChange(rows.filter((_, i) => i !== index));
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit(rows.map((row) => ({ ...row, name: row.name.trim() })));
  };

  return (
    <Box component="form" className="bulk-add-form" onSubmit={handleSubmit}>
      <Typography variant="h5" component="h2" className="bulk-add-form__title">
        Bulk add activities
      </Typography>

      <Stack spacing={2}>
        {rows.map((row, index) => (
          <Stack
            key={index}
            direction="row"
            spacing={2}
            className="bulk-add-form__row"
          >
            <TextField
              label="Activity name"
              value={row.name}
              onChange={(event) => updateRow(index, { name: event.target.value })}
            />

            <FilterDropdown
              title={INTEREST}
              value={row.interest}
              handleChange={(interest) => updateRow(index, { interest })}
            />

            <FilterDropdown
              title={EFFORT}
              value={row.effort}
              handleChange={(effort) => updateRow(index, { effort })}
            />

            <Button
              type="button"
              aria-label={`Remove activity ${index + 1}`}
              onClick={() => removeRow(index)}
              disabled={submitting}
            >
              Remove
            </Button>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} className="bulk-add-form__actions">
        <Button type="button" onClick={addRow} disabled={submitting}>
          Add row
        </Button>

        <Button type="submit" variant="contained" disabled={!canSubmit}>
          Submit
        </Button>
      </Stack>
    </Box>
  );
};

export default BulkAddForm;

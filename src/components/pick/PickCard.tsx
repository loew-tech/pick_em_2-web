import { Cancel, EmojiEvents } from "@mui/icons-material";
import { Alert, Box, Paper, Typography } from "@mui/material";

import type { Pick } from "../../models/Pick";
import "./PickCard.scss";

interface PickCardProps {
  pick: Pick | null;
}

const PickCard = ({ pick }: PickCardProps) => {
  if (!pick) {
    return (
      <Paper className="pick-card pick-card--empty" elevation={4}>
        <Box className="pick-card__icon">
          <Cancel />
        </Box>

        <Alert severity="info">
          No activity matching interest/effort criteria found in selected
          categories.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper className="pick-card" elevation={4}>
      <Box className="pick-card__icon">
        <EmojiEvents />
      </Box>

      <Typography
        className="pick-card__label"
        variant="overline"
        color="text.secondary"
      >
        Your Pick
      </Typography>

      <Typography className="pick-card__name" variant="h4" component="h2">
        {pick.name}
      </Typography>

      <Typography
        className="pick-card__category"
        variant="subtitle1"
        color="text.secondary"
      >
        {pick.category}
      </Typography>
    </Paper>
  );
};

export default PickCard;

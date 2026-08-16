import { Paper, Stack, Typography } from "@mui/material";

import { Tier, TIER_LABELS, type Activity } from "../../models/Activity";
import { EFFORT, INTEREST } from "../../common/constants";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const tierLabel = (tier: Tier): string => TIER_LABELS[tier];
  return (
    <Paper elevation={4} sx={{ p: 2 }}>
      <Typography variant="h6">{activity.name}</Typography>

      <Stack direction="row" spacing={4} sx={{ mt: 1 }}>
        <Typography variant="body2">
          {INTEREST.toUpperCase()}: {tierLabel(activity.interest)}
        </Typography>

        <Typography variant="body2">
          {EFFORT.toUpperCase()}: {tierLabel(activity.effort)}
        </Typography>
      </Stack>
    </Paper>
  );
};
export default ActivityCard;

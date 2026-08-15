import { Paper, Stack, Typography } from "@mui/material";
import { Tier, TIER_LABELS, type Activity } from "../../models/Activity";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const tierLabel = (tier: Tier): string => TIER_LABELS[tier];
  //   const interest =
  //     activity.interest == Tier.HIGH
  //       ? "HIGH"
  //       : activity.interest === Tier.MEDIUM
  //         ? "MEDIUM"
  //         : "LOW";

  //   const effort =
  //     activity.effort == Tier.HIGH
  //       ? "HIGH"
  //       : activity.effort === Tier.MEDIUM
  //         ? "MEDIUM"
  //         : "LOW";
  return (
    <Paper elevation={4} sx={{ p: 2 }}>
      <Typography variant="h6">{activity.name}</Typography>

      <Stack direction="row" spacing={4} sx={{ mt: 1 }}>
        <Typography variant="body2">
          Interest: {tierLabel(activity.interest)}
        </Typography>

        <Typography variant="body2">
          Effort: {tierLabel(activity.effort)}
        </Typography>
      </Stack>
    </Paper>
  );
};
export default ActivityCard;

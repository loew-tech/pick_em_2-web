import { useNavigate } from "react-router-dom";

import { ButtonBase, Paper, Stack, Typography } from "@mui/material";

import { Tier, TIER_LABELS, type Activity } from "../../models/Activity";

import "./ActivityCard.scss";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const navigate = useNavigate();

  const tierLabel = (tier: Tier): string => TIER_LABELS[tier];

  const tierClass = (tier: Tier): string => {
    switch (tier) {
      case Tier.LOW:
        return "low";
      case Tier.MEDIUM:
        return "medium";
      case Tier.HIGH:
        return "high";
    }
  };

  const handleClick = () => {
    navigate(
      `/categories/${activity.category}/activities/${activity.activity_id}`,
    );
  };

  return (
    <ButtonBase className="activity-card-button" onClick={handleClick}>
      <Paper className="activity-card" elevation={1}>
        <Typography className="activity-card__name" variant="h6" component="h3">
          {activity.name}
        </Typography>

        <Stack className="activity-card__metadata" direction="row" spacing={1}>
          <Typography
            className={`activity-card__tag activity-card__tag--interest-${tierClass(activity.interest)}`}
            variant="body2"
          >
            INTEREST: {tierLabel(activity.interest)}
          </Typography>

          <Typography
            className={`activity-card__tag activity-card__tag--effort-${tierClass(activity.effort)}`}
            variant="body2"
          >
            EFFORT: {tierLabel(activity.effort)}
          </Typography>
        </Stack>
      </Paper>
    </ButtonBase>
  );
};

export default ActivityCard;

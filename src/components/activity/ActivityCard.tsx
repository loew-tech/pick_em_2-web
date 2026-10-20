import { useNavigate } from "react-router-dom";

import { Box, ButtonBase, IconButton, Paper, Stack, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { isLocalActivityId, Tier, TIER_LABELS, type Activity } from "../../models/Activity";

import "./ActivityCard.scss";

interface ActivityCardProps {
  activity: Activity;
  onDelete?: (activity: Activity) => void;
  deleteDisabled?: boolean;
  onTemporaryActivityClick?: (activity: Activity) => void;
}

const ActivityCard = ({ activity, onDelete, deleteDisabled = false, onTemporaryActivityClick }: ActivityCardProps) => {
  const isTemporary = isLocalActivityId(activity.activity_id);
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
    if (isTemporary) {
      onTemporaryActivityClick?.(activity);
      return;
    }

    navigate(
      `/categories/${activity.category}/activities/${activity.activity_id}`,
    );
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete?.(activity);
  };

  return (
    <Box className="activity-card-wrapper">
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

      {onDelete && !isTemporary && (
        <IconButton
          className="activity-card__delete"
          aria-label={`Delete ${activity.name}`}
          disabled={deleteDisabled}
          onClick={handleDelete}
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default ActivityCard;

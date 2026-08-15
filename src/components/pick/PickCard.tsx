import { Paper, Typography } from "@mui/material";
import type { Pick } from "../../models/Pick";

interface PickCardProps {
  pick: Pick;
}

const PickCard = ({ pick }: PickCardProps) => {
  return (
    <Paper elevation={4} sx={{ p: 2, backgroundColor: "gold" }}>
      <Typography variant="h6">{pick.category}</Typography>
      <Typography variant="h6">{pick.name}</Typography>
    </Paper>
  );
};
export default PickCard;

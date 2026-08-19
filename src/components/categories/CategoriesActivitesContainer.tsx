import { Grid, Paper, Typography } from "@mui/material";

import type { Category } from "../../models/Category";
import ActivityCard from "../activity/ActivityCard";

import "./CategoriesActivitesContainer.scss";

interface CategoriesActivitesContainerProps {
  key: string;
  category: Category;
}

const CategoriesActivitesContainer = ({
  category,
}: CategoriesActivitesContainerProps) => {
  return (
    <Paper className="category-activities" elevation={0}>
      <Typography
        className="category-activities__title"
        variant="h5"
        component="h2"
      >
        {category.id}
      </Typography>

      <Grid container spacing={2}>
        {category.activities.map((activity) => (
          <Grid key={activity.activity_id} size={{ xs: 12, sm: 6 }}>
            <ActivityCard activity={activity} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default CategoriesActivitesContainer;

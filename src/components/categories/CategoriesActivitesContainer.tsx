import { Container, Grid, Paper, Typography } from "@mui/material";
import type { Category } from "../../models/Category";
import ActivityCard from "../activity/ActivityCard";

interface CategoriesActivitesContainerProps {
  category: Category;
}

const CategoriesActivitesContainer = ({
  category,
}: CategoriesActivitesContainerProps) => {
  return (
    <Container maxWidth="md">
      <Paper elevation={4} sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
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
    </Container>
  );
};
export default CategoriesActivitesContainer;

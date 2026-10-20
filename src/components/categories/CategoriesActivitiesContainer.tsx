import { Typography } from "@mui/material";

import type { Activity } from "../../models/Activity";
import type { Category } from "../../models/Category";
import ActivityCard from "../activity/ActivityCard";

import "./CategoriesActivitiesContainer.scss";

interface CategoriesActivitiesContainerProps {
  category: Category;
  onDeleteActivity?: (activity: Activity) => void;
  deletingId?: string | null;
}

const CategoriesActivitiesContainer = ({
  category,
  onDeleteActivity,
  deletingId = null,
}: CategoriesActivitiesContainerProps) => {
  return (
    <section className="category-activities">
      <Typography
        className="category-activities__title"
        variant="h5"
        component="h2"
      >
        {category.id}
      </Typography>

      <div className="category-activities__grid">
        {category.activities.map((activity) => (
          <ActivityCard
            key={activity.activity_id}
            activity={activity}
            onDelete={onDeleteActivity}
            deleteDisabled={deletingId === activity.activity_id}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoriesActivitiesContainer;

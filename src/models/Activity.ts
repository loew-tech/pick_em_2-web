export type Tier = "low" | "medium" | "high";

export interface Activity {
  activity_id: string | null;
  name: string;
  category: string;
  interest: Tier;
  effort: Tier;
}

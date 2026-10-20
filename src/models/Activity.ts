export const Tier = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;

export type Tier = (typeof Tier)[keyof typeof Tier];

export const TIER_LABELS: Record<Tier, string> = {
  [Tier.LOW]: "LOW",
  [Tier.MEDIUM]: "MEDIUM",
  [Tier.HIGH]: "HIGH",
};

export interface ActivityData {
  name: string;
  category: string;
  interest: Tier;
  effort: Tier;
}

export type BulkAddActivityInput = Omit<ActivityData, "category">;

export interface Activity extends ActivityData {
  activity_id: string;
}

export const LOCAL_ACTIVITY_ID_PREFIX = "local-";

export const isLocalActivityId = (activityId: string): boolean =>
  activityId.startsWith(LOCAL_ACTIVITY_ID_PREFIX);

export const Tier = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;

export type Tier = (typeof Tier)[keyof typeof Tier];

export interface Activity {
  activity_id: string | null;
  name: string;
  category: string;
  interest: Tier;
  effort: Tier;
}

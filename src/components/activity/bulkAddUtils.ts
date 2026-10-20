import { Tier, type BulkAddActivityInput } from "../../models/Activity";

export const createBulkAddRow = (): BulkAddActivityInput => ({
  name: "",
  interest: Tier.LOW,
  effort: Tier.LOW,
});

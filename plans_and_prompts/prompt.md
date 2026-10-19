The task:
Implement a explore category page that supports
1. viewing all activities within a category
2. deleting activities one at a time
3. bulk add to the category
4. filter viewed activities by interest and effort

Background:

The AWS lambda that acts as a backend for this project was updated to support bulk add activities to a given category at path
POST /categories/{category_id}/activities/bulk which takes a body of the following shape.

{
  "activities": [
    {
      "name": "Watch a movie",
      "interest": 3,
      "effort": 1
    },
    {
      "name": "Go for a walk",
      "interest": 2,
      "effort": 1
    }
  ]
}

Phase 1:
For a category, view activities and filter on interest and effort

Phase 2:
Delete individual activities

Phase 3:
Bulk add activities to category
- UI
- api client edit

**For this task, produce a plan only. Do not create, modify, or delete files, install dependencies, or run scaffolding commands.** Inspect the existing directory and relevant project files first, if present. Then explain your proposed approach and wait for my approval. Put your proposal in bulk_add_plan.md

## Planning requirements
Organize your response into these sections:

### 1. Existing Project
Describe the current directory structure, existing code, and relevant tooling you can establish from inspection. Distinguish observed facts from assumptions.

### 2. Proposed Architecture
Explain the proposed architecture.
1. Highlight: 1. what existing architecture has to change. 2. what existing architecture is being leveraged.
2. Discuss testing strategy

### 3. Scaffolding plan
List the files and directories you intend to create, their responsibilities, the dependencies you propose to install, and the commands you would use. Explain why your choices are appropriate.

### 4. Phase-by-phase plan
For each phase, describe the implementation order, expected deliverables, tests, and acceptance criteria. Explain how each phase builds on the previous one.

### 5. Risks and open questions
Identify ambiguities, technical risks, and decisions that materially affect the design. Do not silently make consequential product decisions.

### 6. Recommended next step
Propose the smallest useful first implementation milestone and state what you need me to approve or clarify before starting.

Constraints:
1. Do not write code until I approve it
2. Prefer simple and readable solutions over "slickness" or pre-mature generalizations
3. Avoid unnecessary dependencies.
4. Implement phases 1 at a time, waiting for approval between each phase

Models:

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

export interface Activity extends ActivityData {
  activity_id: string;
}

export interface Category {
  id: string;
  activities: Activity[];
}



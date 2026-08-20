import { fetchAuthSession } from "aws-amplify/auth";

import type { Activity, ActivityData, Tier } from "../models/Activity";
import type { Pick } from "../models/Pick";
import { CATEGORY } from "../common/constants";
import {
  AuthenticationError,
  API_Error,
  ClientArgumentError,
} from "../common/errors";
import type { Category } from "../models/Category";
import type { CategoriesIdsResponse } from "../common/types";

const API_URL = import.meta.env.VITE_API_URL;
const INVALID_CATEGORY_CHARS = /[\\/?#%]/;

export async function getCategoriesIds(): Promise<CategoriesIdsResponse> {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${API_URL}/categories`, {
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    throw new API_Error(response.status);
  }

  return response.json();
}

export async function getCategories(categories: string[]): Promise<Category[]> {
  const authHeader = await getAuthHeader();

  return Promise.all(
    categories.map((category) => getCategory(category, authHeader)),
  );
}

export async function getCategory(
  category: string,
  authHeader: string,
): Promise<Category> {
  const response = await fetch(
    `${API_URL}/categories/${encodeURIComponent(category)}`,
    {
      headers: {
        Authorization: authHeader,
      },
    },
  );

  if (!response.ok) {
    throw new API_Error(response.status);
  }

  return (await response.json()) as Category;
}

export async function getActivity(
  category: string,
  activityId: string,
): Promise<Activity> {
  const authHeader = await getAuthHeader();

  const response = await fetch(
    `${API_URL}/categories/${encodeURIComponent(category)}/activities/${encodeURIComponent(activityId)}`,
    {
      headers: {
        Authorization: authHeader,
      },
    },
  );

  if (!response.ok) {
    throw new API_Error(response.status);
  }

  return (await response.json()) as Activity;
}

export async function updateActivity(
  activityId: string | undefined,
  activity: ActivityData,
): Promise<void> {
  if (!activityId) {
    throw new ClientArgumentError(
      "Activity object must have valid activity_id in order to update.",
    );
  }

  const authHeader = await getAuthHeader();

  const response = await fetch(
    `${API_URL}/categories/${encodeURIComponent(activity.category)}/activities/${encodeURIComponent(activityId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interest: activity.interest,
        effort: activity.effort,
      }),
    },
  );

  if (!response.ok) {
    throw new API_Error(response.status);
  }
}

export async function removeActivity(
  activityId: string | undefined,
  activity: ActivityData,
): Promise<void> {
  if (!activityId) {
    throw new ClientArgumentError(
      "Activity object must have a valid activity_id in order to remove.",
    );
  }

  const authHeader = await getAuthHeader();

  const response = await fetch(
    `${API_URL}/categories/${encodeURIComponent(activity.category)}/activities/${encodeURIComponent(activityId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    },
  );

  if (!response.ok) {
    throw new API_Error(response.status);
  }
}

export async function addActivity(activity: ActivityData): Promise<void> {
  if (!isValidCategory(activity.category)) {
    throw new ClientArgumentError(CATEGORY);
  }

  const authHeader = await getAuthHeader();
  const response = await fetch(
    `${API_URL}/categories/${encodeURIComponent(activity.category)}/activities`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: activityToJSONRequestObject(activity),
    },
  );

  if (!response.ok) {
    throw new API_Error(response.status);
  }
}

export async function getPick(
  categoryIds: string[],
  interest: Tier,
  effort: Tier,
): Promise<Pick | null> {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${API_URL}/pick`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      categories: categoryIds,
      interest,
      effort,
    }),
  });

  if (response.status == 404) {
    return null;
  }

  if (!response.ok) {
    throw new API_Error(response.status);
  }

  return (await response.json()) as Pick;
}

async function getAuthHeader(): Promise<string> {
  const { tokens } = await fetchAuthSession();
  if (!tokens || !tokens?.idToken) {
    throw new AuthenticationError();
  }
  return `Bearer ${tokens.idToken!.toString()}`;
}

function isValidCategory(category: string): boolean {
  return !INVALID_CATEGORY_CHARS.test(category);
}

function activityToJSONRequestObject(activity: ActivityData): string {
  return JSON.stringify({
    name: activity.name,
    body: {
      interest: activity.interest,
      effort: activity.effort,
    },
  });
}

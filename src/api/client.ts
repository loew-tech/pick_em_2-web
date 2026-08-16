import { fetchAuthSession } from "aws-amplify/auth";

import type { Activity, Tier } from "../models/Activity";
import type { Pick } from "../models/Pick";
import { CATEGORY } from "../common/constants";
import {
  AuthenticationError,
  API_Error,
  ClientArgumentError,
} from "../common/errors";
import type { Category } from "../models/Category";

const API_URL = import.meta.env.VITE_API_URL;
const INVALID_CATEGORY_CHARS = /[\\/?#%]/;

export async function getCategoriesIds(): Promise<string[]> {
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

// @TODO: implement
export async function updateActivity(activity: Activity): Promise<boolean> {
  console.log("update called", activity);
  return false;
}

// @TODO: implement
export async function removeActivity(activity: Activity): Promise<boolean> {
  console.log("remove called", activity);
  return false;
}

export async function addActivity(activity: Activity): Promise<boolean> {
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

  return true;
}

export async function getPick(
  categoryIds: string[],
  interest: Tier,
  effort: Tier,
): Promise<Pick> {
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

function activityToJSONRequestObject(activity: Activity): string {
  return JSON.stringify({
    name: activity.name,
    body: {
      interest: activity.interest,
      effort: activity.effort,
    },
  });
}

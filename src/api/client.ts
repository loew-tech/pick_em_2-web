import { fetchAuthSession } from "aws-amplify/auth";

import type { Activity } from "../models/Activity";
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

export async function getCategoriesIds() {
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

  return response.json();
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
    `${API_URL}/activities/${encodeURIComponent(activity.category)}`,
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

// @TODO: implement
export async function getPick(categoriesIds: string[]): Promise<Pick> {
  console.log("PICK!", categoriesIds);
  return { name: "dummy-test-activity-name", category: "" };
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

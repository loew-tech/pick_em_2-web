import { fetchAuthSession } from "aws-amplify/auth";

import type { Activity } from "../models/Activity";
import { CATEGORY } from "../common/constants";
import {
  AuthenticationError,
  API_Error,
  ClientArgumentError,
} from "../common/errors";

const API_URL = import.meta.env.VITE_API_URL;
const INVALID_CATEGORY_CHARS = /[\\/?#%]/;

export async function getCategories() {
  const { tokens } = await fetchAuthSession();
  if (!tokens?.idToken) {
    throw new AuthenticationError();
  }

  const response = await fetch(`${API_URL}/categories`, {
    headers: {
      Authorization: `Bearer ${tokens.idToken.toString()}`,
    },
  });

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

// @TODO: implement
export async function addActivity(activity: Activity): Promise<boolean> {
  const { tokens } = await fetchAuthSession();
  if (!tokens?.idToken) {
    throw new AuthenticationError();
  }

  if (!isValidCategory(activity.category)) {
    throw new ClientArgumentError(CATEGORY);
  }

  const response = await fetch(
    `${API_URL}/activities/${encodeURIComponent(activity.category)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.idToken.toString()}`,
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

import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = import.meta.env.VITE_API_URL;

export async function getCategories() {
  const { tokens } = await fetchAuthSession();

  console.log(API_URL);

  if (!tokens?.idToken) {
    throw new Error("User is not authenticated.");
  }

  const response = await fetch(`${API_URL}/categories`, {
    headers: {
      Authorization: `Bearer ${tokens.idToken.toString()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

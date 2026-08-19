import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchAuthSession } from "aws-amplify/auth";

import type { Activity, Tier } from "../../models/Activity";
import type { Pick } from "../../models/Pick";
import type { Category } from "../../models/Category";
import {
  AuthenticationError,
  API_Error,
  ClientArgumentError,
} from "../../common/errors";

import {
  getCategoriesIds,
  getCategories,
  getCategory,
  getActivity,
  updateActivity,
  removeActivity,
  addActivity,
  getPick,
} from "../client";

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

const mockFetchAuthSession = vi.mocked(fetchAuthSession);

const API_URL = import.meta.env.VITE_API_URL;

const AUTH_TOKEN = "test-token";
const AUTH_HEADER = `Bearer ${AUTH_TOKEN}`;

const activity: Activity = {
  activity_id: "activity-1",
  category: "movies",
  name: "Watch a movie",
  interest: 3 as Tier,
  effort: 1 as Tier,
};

const category: Category = {
  id: "movies",
  activities: [activity],
};

const pick: Pick = {
  name: "Watch a movie",
  category: "movies",
};

function mockAuthenticatedSession(): void {
  mockFetchAuthSession.mockResolvedValue({
    tokens: {
      idToken: {
        toString: () => AUTH_TOKEN,
      },
    },
  } as Awaited<ReturnType<typeof fetchAuthSession>>);
}

function mockResponse(body: unknown = undefined, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthenticatedSession();
  vi.stubGlobal("fetch", vi.fn());
});

describe("getCategoriesIds", () => {
  it("returns category IDs", async () => {
    const categories = ["movies", "podcasts"];

    vi.mocked(fetch).mockResolvedValue(mockResponse(categories));

    const result = await getCategoriesIds();

    expect(result).toEqual(categories);
    expect(fetch).toHaveBeenCalledWith(`${API_URL}/categories`, {
      headers: {
        Authorization: AUTH_HEADER,
      },
    });
  });

  it("throws API_Error when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(undefined, 500));

    await expect(getCategoriesIds()).rejects.toBeInstanceOf(API_Error);
  });

  it("throws AuthenticationError when there is no ID token", async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: undefined,
    } as Awaited<ReturnType<typeof fetchAuthSession>>);

    await expect(getCategoriesIds()).rejects.toBeInstanceOf(
      AuthenticationError,
    );

    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("getCategories", () => {
  it("gets each requested category", async () => {
    const categories = ["movies", "podcasts"];

    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(category))
      .mockResolvedValueOnce(
        mockResponse({
          ID: "podcasts",
          ACTIVITIES: [],
        }),
      );

    const result = await getCategories(categories);

    expect(result).toEqual([
      category,
      {
        ID: "podcasts",
        ACTIVITIES: [],
      },
    ]);

    expect(fetch).toHaveBeenNthCalledWith(1, `${API_URL}/categories/movies`, {
      headers: {
        Authorization: AUTH_HEADER,
      },
    });

    expect(fetch).toHaveBeenNthCalledWith(2, `${API_URL}/categories/podcasts`, {
      headers: {
        Authorization: AUTH_HEADER,
      },
    });
  });

  it("returns an empty array when given no categories", async () => {
    const result = await getCategories([]);

    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("propagates an API_Error from a category request", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(undefined, 404));

    await expect(getCategories(["movies"])).rejects.toBeInstanceOf(API_Error);
  });
});

describe("getCategory", () => {
  it("returns a category", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(category));

    const result = await getCategory("movies", AUTH_HEADER);

    expect(result).toEqual(category);
    expect(fetch).toHaveBeenCalledWith(`${API_URL}/categories/movies`, {
      headers: {
        Authorization: AUTH_HEADER,
      },
    });
  });

  it("encodes the category in the URL", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(category));

    await getCategory("sci/fi", AUTH_HEADER);

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/categories/sci%2Ffi`, {
      headers: {
        Authorization: AUTH_HEADER,
      },
    });
  });

  it("throws API_Error when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(undefined, 404));

    await expect(getCategory("movies", AUTH_HEADER)).rejects.toBeInstanceOf(
      API_Error,
    );
  });
});

describe("getActivity", () => {
  it("returns an activity", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(activity));

    const result = await getActivity("movies", "activity-1");

    expect(result).toEqual(activity);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/categories/movies/activities/activity-1`,
      {
        headers: {
          Authorization: AUTH_HEADER,
        },
      },
    );
  });

  it("encodes the category and activity ID in the URL", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(activity));

    await getActivity("sci/fi", "activity/1");

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/categories/sci%2Ffi/activities/activity%2F1`,
      {
        headers: {
          Authorization: AUTH_HEADER,
        },
      },
    );
  });

  it("throws API_Error when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(undefined, 404));

    await expect(getActivity("movies", "activity-1")).rejects.toBeInstanceOf(
      API_Error,
    );
  });
});

describe("updateActivity", () => {
  it("updates an activity", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse());

    await updateActivity("", activity);

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/categories/movies/activities/activity-1`,
      {
        method: "PUT",
        headers: {
          Authorization: AUTH_HEADER,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interest: activity.interest,
          effort: activity.effort,
        }),
      },
    );
  });

  it("throws ClientArgumentError when activity_id is missing", async () => {
    const invalidActivity = {
      ...activity,
      activity_id: "",
    };

    await expect(updateActivity("", invalidActivity)).rejects.toBeInstanceOf(
      ClientArgumentError,
    );

    expect(fetch).not.toHaveBeenCalled();
    expect(mockFetchAuthSession).not.toHaveBeenCalled();
  });

  it("throws API_Error when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(undefined, 400));

    await expect(
      updateActivity(activity.activity_id, activity),
    ).rejects.toBeInstanceOf(API_Error);
  });

  it("encodes the category and activity ID", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse());

    await updateActivity("activity/1", {
      name: activity.name,
      interest: activity.interest,
      effort: activity.effort,
      category: "sci/fi",
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/categories/sci%2Ffi/activities/activity%2F1`,
      expect.objectContaining({
        method: "PUT",
      }),
    );
  });
});

describe("removeActivity", () => {
  it("removes an activity", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse());

    await removeActivity(activity.activity_id, activity);

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/categories/movies/activities/activity-1`,
      {
        method: "DELETE",
        headers: {
          Authorization: AUTH_HEADER,
        },
      },
    );
  });

  it("throws ClientArgumentError when activity_id is missing", async () => {
    const invalidActivity = {
      ...activity,
      activity_id: "",
    };

    await expect(
      removeActivity(invalidActivity.activity_id, invalidActivity),
    ).rejects.toBeInstanceOf(ClientArgumentError);

    expect(fetch).not.toHaveBeenCalled();
    expect(mockFetchAuthSession).not.toHaveBeenCalled();
  });

  it("throws API_Error when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(undefined, 404));

    await expect(
      removeActivity(activity.activity_id, activity),
    ).rejects.toBeInstanceOf(API_Error);
  });
});

describe("addActivity", () => {
  it("adds an activity", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse());

    await addActivity(activity);

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/categories/movies/activities`,
      {
        method: "POST",
        headers: {
          Authorization: AUTH_HEADER,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: activity.name,
          body: {
            interest: activity.interest,
            effort: activity.effort,
          },
        }),
      },
    );
  });

  it("throws ClientArgumentError for a category containing a slash", async () => {
    const invalidActivity = {
      ...activity,
      category: "sci/fi",
    };

    await expect(addActivity(invalidActivity)).rejects.toBeInstanceOf(
      ClientArgumentError,
    );

    expect(fetch).not.toHaveBeenCalled();
    expect(mockFetchAuthSession).not.toHaveBeenCalled();
  });

  it.each([
    ["backslash", "sci\\fi"],
    ["question mark", "sci?fi"],
    ["hash", "sci#fi"],
    ["percent", "sci%fi"],
  ])("rejects a category containing a %s", async (_name, category) => {
    const invalidActivity = {
      ...activity,
      category,
    };

    await expect(addActivity(invalidActivity)).rejects.toBeInstanceOf(
      ClientArgumentError,
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  it("throws API_Error when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(undefined, 400));

    await expect(addActivity(activity)).rejects.toBeInstanceOf(API_Error);
  });

  it("encodes the category in the URL", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse());

    await addActivity({
      ...activity,
      category: "sci-fi & TV",
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/categories/sci-fi%20%26%20TV/activities`,
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});

describe("getPick", () => {
  it("returns the selected pick", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(pick));

    const result = await getPick(["movies", "podcasts"], 3 as Tier, 1 as Tier);

    expect(result).toEqual(pick);

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/pick`, {
      method: "POST",
      headers: {
        Authorization: AUTH_HEADER,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categories: ["movies", "podcasts"],
        interest: 3,
        effort: 1,
      }),
    });
  });

  it("throws API_Error when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(undefined, 500));

    await expect(
      getPick(["movies"], 3 as Tier, 1 as Tier),
    ).rejects.toBeInstanceOf(API_Error);
  });

  it("throws AuthenticationError when authentication is unavailable", async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: undefined,
    } as Awaited<ReturnType<typeof fetchAuthSession>>);

    await expect(
      getPick(["movies"], 3 as Tier, 1 as Tier),
    ).rejects.toBeInstanceOf(AuthenticationError);

    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("authentication", () => {
  it("uses the ID token as a Bearer token", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse([]));

    await getCategoriesIds();

    expect(mockFetchAuthSession).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/categories`,
      expect.objectContaining({
        headers: {
          Authorization: "Bearer test-token",
        },
      }),
    );
  });

  it("throws AuthenticationError when tokens are missing", async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: undefined,
    } as Awaited<ReturnType<typeof fetchAuthSession>>);

    await expect(getCategoriesIds()).rejects.toBeInstanceOf(
      AuthenticationError,
    );
  });

  it("throws AuthenticationError when the ID token is missing", async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: {},
    } as Awaited<ReturnType<typeof fetchAuthSession>>);

    await expect(getCategoriesIds()).rejects.toBeInstanceOf(
      AuthenticationError,
    );

    expect(fetch).not.toHaveBeenCalled();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackendApiError, listEpisodes } from "./episodes";

describe("listEpisodes", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the backend with no query params when none are given", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ episodes: [], page: 1, totalPages: 0, totalCount: 0, hasNext: false, hasPrevious: false }), {
        status: 200,
      }),
    );

    await listEpisodes({});

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/episodes", expect.anything());
  });

  it("forwards search and page as query params", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ episodes: [], page: 2, totalPages: 0, totalCount: 0, hasNext: false, hasPrevious: false }), {
        status: 200,
      }),
    );

    await listEpisodes({ search: "pilot", page: 2 });

    const requestedUrl = new URL(fetchMock.mock.calls[0]?.[0] as string);
    expect(requestedUrl.pathname).toBe("/episodes");
    expect(requestedUrl.searchParams.get("search")).toBe("pilot");
    expect(requestedUrl.searchParams.get("page")).toBe("2");
  });

  it("throws BackendApiError when the backend responds with a non-ok status", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response("", { status: 502 }));

    await expect(listEpisodes({})).rejects.toThrow(BackendApiError);
  });

  it("throws BackendApiError when the backend is unreachable", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    await expect(listEpisodes({})).rejects.toThrow(BackendApiError);
  });
});

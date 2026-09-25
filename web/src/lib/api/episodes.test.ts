import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackendApiError, getEpisodeDetail, listEpisodes } from "./episodes";

describe("listEpisodes", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the backend with no query params when none are given, and returns the parsed body", async () => {
    const fetchMock = vi.mocked(fetch);
    const body = {
      episodes: [{ id: 1, name: "Pilot", airDate: "December 2, 2013", episodeCode: "S01E01" }],
      page: 1,
      totalPages: 1,
      totalCount: 1,
      hasNext: false,
      hasPrevious: false,
    };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));

    const result = await listEpisodes({});

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/episodes", expect.anything());
    expect(result).toEqual(body);
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

describe("getEpisodeDetail", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the episode by id and returns the parsed body", async () => {
    const fetchMock = vi.mocked(fetch);
    const body = {
      id: 1,
      name: "Pilot",
      airDate: "December 2, 2013",
      episodeCode: "S01E01",
      characters: [{ id: 1, name: "Rick Sanchez", image: "https://example.com/rick.jpeg" }],
    };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));

    const result = await getEpisodeDetail(1);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/episodes/1", expect.anything());
    expect(result).toEqual(body);
  });

  it("throws BackendApiError with the status when the backend responds 404", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response("", { status: 404 }));

    const error = await getEpisodeDetail(999).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(BackendApiError);
    expect((error as BackendApiError).status).toBe(404);
  });

  it("throws BackendApiError when the backend is unreachable", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    await expect(getEpisodeDetail(1)).rejects.toThrow(BackendApiError);
  });
});

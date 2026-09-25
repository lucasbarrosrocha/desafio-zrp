import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildServer } from "../../src/interface/http/build-server.js";
import { upstreamServer } from "../mocks/upstream-server.js";

const UPSTREAM_URL = "https://rickandmortyapi.com/api";

const testEnv = {
  port: 0,
  host: "127.0.0.1",
  upstreamApiUrl: UPSTREAM_URL,
};

function episodeListResponse() {
  return {
    info: { count: 1, pages: 1, next: null, prev: null },
    results: [{ id: 1, name: "Pilot", air_date: "December 2, 2013", episode: "S01E01" }],
  };
}

beforeAll(() => upstreamServer.listen({ onUnhandledRequest: "error" }));
afterEach(() => upstreamServer.resetHandlers());
afterAll(() => upstreamServer.close());

describe("GET /episodes", () => {
  it("returns the mapped, paginated episode list", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode`, () => HttpResponse.json(episodeListResponse())),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      episodes: [{ id: 1, name: "Pilot", airDate: "December 2, 2013", episodeCode: "S01E01" }],
      page: 1,
      totalPages: 1,
      totalCount: 1,
      hasNext: false,
      hasPrevious: false,
    });

    await app.close();
  });

  it("forwards the search term as the upstream name filter", async () => {
    let capturedUrl: URL | undefined;
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json(episodeListResponse());
      }),
    );
    const app = await buildServer(testEnv);

    await app.inject({ method: "GET", url: "/episodes?search=pilot" });

    expect(capturedUrl?.searchParams.get("name")).toBe("pilot");

    await app.close();
  });

  it("forwards the requested page", async () => {
    let capturedUrl: URL | undefined;
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json(episodeListResponse());
      }),
    );
    const app = await buildServer(testEnv);

    await app.inject({ method: "GET", url: "/episodes?page=2" });

    expect(capturedUrl?.searchParams.get("page")).toBe("2");

    await app.close();
  });

  it("returns an empty page when the upstream API has no results (404)", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode`, () =>
        HttpResponse.json({ error: "There is nothing here" }, { status: 404 }),
      ),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes?search=doesnotexist" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      episodes: [],
      page: 1,
      totalPages: 0,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false,
    });

    await app.close();
  });

  it.each([
    ["abc", "not a number"],
    ["1.5", "not an integer"],
    ["0", "below the minimum"],
    ["-1", "negative"],
    ["-0", "negative zero"],
    ["Infinity", "not finite"],
    ["1e21", "not a safe integer"],
  ])("rejects page=%s (%s) with 400", async (page) => {
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: `/episodes?page=${page}` });

    expect(response.statusCode).toBe(400);

    await app.close();
  });

  it("rejects a repeated query parameter with 400", async () => {
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes?search=a&search=b" });

    expect(response.statusCode).toBe(400);

    await app.close();
  });

  it("returns 502 when the upstream API responds with a server error", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode`, () => HttpResponse.json({}, { status: 500 })),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes" });

    expect(response.statusCode).toBe(502);

    await app.close();
  });

  it("returns 502 when the upstream API is unreachable", async () => {
    upstreamServer.use(http.get(`${UPSTREAM_URL}/episode`, () => HttpResponse.error()));
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes" });

    expect(response.statusCode).toBe(502);

    await app.close();
  });

  it("returns 502 when the upstream API returns a malformed body", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode`, () => new HttpResponse("not json {{{", { status: 200 })),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes" });

    expect(response.statusCode).toBe(502);

    await app.close();
  });
});

function episodeDetailResponse() {
  return {
    id: 1,
    name: "Pilot",
    air_date: "December 2, 2013",
    episode: "S01E01",
    characters: [
      "https://rickandmortyapi.com/api/character/1",
      "https://rickandmortyapi.com/api/character/2",
    ],
  };
}

function character(id: number, name: string) {
  return { id, name, image: `https://rickandmortyapi.com/api/character/avatar/${id}.jpeg` };
}

describe("GET /episodes/:id", () => {
  it("returns the episode with its characters sorted by name", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode/1`, () => HttpResponse.json(episodeDetailResponse())),
      http.get(`${UPSTREAM_URL}/character/1,2`, () =>
        HttpResponse.json([character(2, "Summer Smith"), character(1, "Morty Smith")]),
      ),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes/1" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: 1,
      name: "Pilot",
      airDate: "December 2, 2013",
      episodeCode: "S01E01",
      characters: [
        { id: 1, name: "Morty Smith", image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg" },
        { id: 2, name: "Summer Smith", image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg" },
      ],
    });

    await app.close();
  });

  it("handles a single character id (upstream returns an object, not an array)", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode/1`, () =>
        HttpResponse.json({ ...episodeDetailResponse(), characters: ["https://rickandmortyapi.com/api/character/1"] }),
      ),
      http.get(`${UPSTREAM_URL}/character/1`, () => HttpResponse.json(character(1, "Rick Sanchez"))),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes/1" });

    expect(response.statusCode).toBe(200);
    expect(response.json().characters).toEqual([
      { id: 1, name: "Rick Sanchez", image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg" },
    ]);

    await app.close();
  });

  it("returns 404 when the episode does not exist", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode/999`, () =>
        HttpResponse.json({ error: "Episode not found" }, { status: 404 }),
      ),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes/999" });

    expect(response.statusCode).toBe(404);

    await app.close();
  });

  it.each([
    ["abc", "not a number"],
    ["1.5", "not an integer"],
    ["0", "below the minimum"],
    ["-1", "negative"],
  ])("rejects id=%s (%s) with 400", async (id) => {
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: `/episodes/${id}` });

    expect(response.statusCode).toBe(400);

    await app.close();
  });

  it("returns 502 when the upstream API is unreachable while fetching the episode", async () => {
    upstreamServer.use(http.get(`${UPSTREAM_URL}/episode/1`, () => HttpResponse.error()));
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes/1" });

    expect(response.statusCode).toBe(502);

    await app.close();
  });

  it("returns 502 when the upstream API is unreachable while fetching characters", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode/1`, () => HttpResponse.json(episodeDetailResponse())),
      http.get(`${UPSTREAM_URL}/character/1,2`, () => HttpResponse.error()),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes/1" });

    expect(response.statusCode).toBe(502);

    await app.close();
  });
});

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

  it("rejects a non-numeric page with 400", async () => {
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes?page=abc" });

    expect(response.statusCode).toBe(400);

    await app.close();
  });

  it("rejects a page below 1 with 400", async () => {
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes?page=0" });

    expect(response.statusCode).toBe(400);

    await app.close();
  });

  it("returns 502 when the upstream API is unreachable", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/episode`, () => HttpResponse.json({}, { status: 500 })),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/episodes" });

    expect(response.statusCode).toBe(502);

    await app.close();
  });
});

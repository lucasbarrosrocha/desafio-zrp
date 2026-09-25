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

function characterDetailResponse() {
  return {
    id: 1,
    name: "Rick Sanchez",
    status: "Alive",
    species: "Human",
    type: "",
    gender: "Male",
    origin: { name: "Earth (C-137)", url: "https://rickandmortyapi.com/api/location/1" },
    location: { name: "Citadel of Ricks", url: "https://rickandmortyapi.com/api/location/3" },
    image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    episode: ["https://rickandmortyapi.com/api/episode/1"],
    url: "https://rickandmortyapi.com/api/character/1",
    created: "2017-11-04T18:48:46.250Z",
  };
}

beforeAll(() => upstreamServer.listen({ onUnhandledRequest: "error" }));
afterEach(() => upstreamServer.resetHandlers());
afterAll(() => upstreamServer.close());

describe("GET /characters/:id", () => {
  it("returns the mapped character detail", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/character/1`, () => HttpResponse.json(characterDetailResponse())),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/characters/1" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: 1,
      name: "Rick Sanchez",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      origin: "Earth (C-137)",
      location: "Citadel of Ricks",
      image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    });

    await app.close();
  });

  it("returns 404 when the character does not exist", async () => {
    upstreamServer.use(
      http.get(`${UPSTREAM_URL}/character/999`, () =>
        HttpResponse.json({ error: "Character not found" }, { status: 404 }),
      ),
    );
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/characters/999" });

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

    const response = await app.inject({ method: "GET", url: `/characters/${id}` });

    expect(response.statusCode).toBe(400);

    await app.close();
  });

  it("returns 502 when the upstream API is unreachable", async () => {
    upstreamServer.use(http.get(`${UPSTREAM_URL}/character/1`, () => HttpResponse.error()));
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/characters/1" });

    expect(response.statusCode).toBe(502);

    await app.close();
  });

  it("returns 502 when the upstream API responds with a server error", async () => {
    upstreamServer.use(http.get(`${UPSTREAM_URL}/character/1`, () => HttpResponse.json({}, { status: 500 })));
    const app = await buildServer(testEnv);

    const response = await app.inject({ method: "GET", url: "/characters/1" });

    expect(response.statusCode).toBe(502);

    await app.close();
  });
});

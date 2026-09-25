import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCharacterDetail } from "./get-character-detail";

describe("getCharacterDetail", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the character by id and returns it wrapped in an ok result", async () => {
    const fetchMock = vi.mocked(fetch);
    const character = {
      id: 1,
      name: "Rick Sanchez",
      status: "Alive",
      species: "Human",
      type: "",
      gender: "Male",
      origin: "Earth (C-137)",
      location: "Citadel of Ricks",
      image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(character), { status: 200 }));

    const result = await getCharacterDetail(1);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/characters/1", expect.anything());
    expect(result).toEqual({ ok: true, character });
  });

  it("returns a not-ok result with the status on a non-ok response", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response("", { status: 404 }));

    const result = await getCharacterDetail(999);

    expect(result).toEqual({ ok: false, status: 404 });
  });

  it("returns a not-ok result with no status when the backend is unreachable", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const result = await getCharacterDetail(1);

    expect(result).toEqual({ ok: false });
  });
});

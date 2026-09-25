import { describe, expect, it, vi } from "vitest";
import { GetEpisodeDetailUseCase } from "../../src/application/use-cases/get-episode-detail.use-case.js";
import type { CharacterSummary } from "../../src/domain/entities/character-summary.js";
import type { CharacterRepository } from "../../src/domain/repositories/character-repository.js";
import type { EpisodeRepository, EpisodeWithCharacterIds } from "../../src/domain/repositories/episode-repository.js";

function episode(overrides: Partial<EpisodeWithCharacterIds> = {}): EpisodeWithCharacterIds {
  return {
    id: 1,
    name: "Pilot",
    airDate: "December 2, 2013",
    episodeCode: "S01E01",
    characterIds: [1, 2],
    ...overrides,
  };
}

function character(overrides: Partial<CharacterSummary> = {}): CharacterSummary {
  return { id: 1, name: "Rick Sanchez", image: "https://example.com/rick.jpeg", ...overrides };
}

describe("GetEpisodeDetailUseCase", () => {
  it("returns null when the episode repository finds nothing", async () => {
    const findById = vi.fn().mockResolvedValue(null);
    const findByIds = vi.fn();
    const useCase = new GetEpisodeDetailUseCase(
      { findById, list: vi.fn() } satisfies EpisodeRepository,
      { findByIds } satisfies CharacterRepository,
    );

    const result = await useCase.execute(999);

    expect(result).toBeNull();
    expect(findByIds).not.toHaveBeenCalled();
  });

  it("fetches characters by the episode's character ids", async () => {
    const findById = vi.fn().mockResolvedValue(episode({ characterIds: [1, 2, 35] }));
    const findByIds = vi.fn().mockResolvedValue([]);
    const useCase = new GetEpisodeDetailUseCase(
      { findById, list: vi.fn() } satisfies EpisodeRepository,
      { findByIds } satisfies CharacterRepository,
    );

    await useCase.execute(1);

    expect(findByIds).toHaveBeenCalledWith([1, 2, 35]);
  });

  it("sorts the characters alphabetically by name", async () => {
    const findById = vi.fn().mockResolvedValue(episode());
    const findByIds = vi
      .fn()
      .mockResolvedValue([character({ id: 2, name: "Summer Smith" }), character({ id: 1, name: "Morty Smith" })]);
    const useCase = new GetEpisodeDetailUseCase(
      { findById, list: vi.fn() } satisfies EpisodeRepository,
      { findByIds } satisfies CharacterRepository,
    );

    const result = await useCase.execute(1);

    expect(result?.characters.map((c) => c.name)).toEqual(["Morty Smith", "Summer Smith"]);
  });

  it("combines the episode fields with the sorted characters", async () => {
    const findById = vi.fn().mockResolvedValue(episode({ id: 3, name: "Anatomy Park", characterIds: [1] }));
    const findByIds = vi.fn().mockResolvedValue([character({ id: 1, name: "Rick Sanchez" })]);
    const useCase = new GetEpisodeDetailUseCase(
      { findById, list: vi.fn() } satisfies EpisodeRepository,
      { findByIds } satisfies CharacterRepository,
    );

    const result = await useCase.execute(3);

    expect(result).toEqual({
      id: 3,
      name: "Anatomy Park",
      airDate: "December 2, 2013",
      episodeCode: "S01E01",
      characters: [{ id: 1, name: "Rick Sanchez", image: "https://example.com/rick.jpeg" }],
    });
  });
});

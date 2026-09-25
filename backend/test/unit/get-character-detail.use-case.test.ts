import { describe, expect, it, vi } from "vitest";
import { GetCharacterDetailUseCase } from "../../src/application/use-cases/get-character-detail.use-case.js";
import type { CharacterDetail } from "../../src/domain/entities/character-detail.js";
import type { CharacterRepository } from "../../src/domain/repositories/character-repository.js";

function characterDetail(overrides: Partial<CharacterDetail> = {}): CharacterDetail {
  return {
    id: 1,
    name: "Rick Sanchez",
    status: "Alive",
    species: "Human",
    type: "",
    gender: "Male",
    origin: "Earth (C-137)",
    location: "Citadel of Ricks",
    image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    ...overrides,
  };
}

describe("GetCharacterDetailUseCase", () => {
  it("returns whatever the repository resolves for a found character", async () => {
    const character = characterDetail();
    const findById = vi.fn().mockResolvedValue(character);
    const useCase = new GetCharacterDetailUseCase({ findById, findByIds: vi.fn() } satisfies CharacterRepository);

    const result = await useCase.execute(1);

    expect(result).toBe(character);
    expect(findById).toHaveBeenCalledWith(1);
  });

  it("returns null when the repository finds nothing", async () => {
    const findById = vi.fn().mockResolvedValue(null);
    const useCase = new GetCharacterDetailUseCase({ findById, findByIds: vi.fn() } satisfies CharacterRepository);

    const result = await useCase.execute(999);

    expect(result).toBeNull();
  });
});

import type { CharacterDetail } from "../../domain/entities/character-detail.js";
import type { CharacterRepository } from "../../domain/repositories/character-repository.js";

export class GetCharacterDetailUseCase {
  constructor(private readonly characterRepository: CharacterRepository) {}

  async execute(id: number): Promise<CharacterDetail | null> {
    return this.characterRepository.findById(id);
  }
}

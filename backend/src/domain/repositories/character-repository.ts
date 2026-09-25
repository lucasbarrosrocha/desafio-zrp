import type { CharacterSummary } from "../entities/character-summary.js";

export interface CharacterRepository {
  findByIds(ids: number[]): Promise<CharacterSummary[]>;
}

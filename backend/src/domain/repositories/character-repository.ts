import type { CharacterDetail } from "../entities/character-detail.js";
import type { CharacterSummary } from "../entities/character-summary.js";

export interface CharacterRepository {
  findByIds(ids: number[]): Promise<CharacterSummary[]>;
  findById(id: number): Promise<CharacterDetail | null>;
}

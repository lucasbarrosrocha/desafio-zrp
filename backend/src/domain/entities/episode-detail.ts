import type { CharacterSummary } from "./character-summary.js";
import type { Episode } from "./episode.js";

export interface EpisodeDetail extends Episode {
  characters: CharacterSummary[];
}

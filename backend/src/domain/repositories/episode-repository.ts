import type { Episode } from "../entities/episode.js";
import type { PaginatedResult } from "../entities/paginated-result.js";

export interface ListEpisodesQuery {
  page: number;
  search?: string;
}

export interface EpisodeWithCharacterIds extends Episode {
  characterIds: number[];
}

export interface EpisodeRepository {
  list(query: ListEpisodesQuery): Promise<PaginatedResult<Episode>>;
  findById(id: number): Promise<EpisodeWithCharacterIds | null>;
}

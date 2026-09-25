import type { Episode } from "../../domain/entities/episode.js";
import type { PaginatedResult } from "../../domain/entities/paginated-result.js";
import type { EpisodeRepository } from "../../domain/repositories/episode-repository.js";

export interface ListEpisodesInput {
  page: number;
  search?: string;
}

export class ListEpisodesUseCase {
  constructor(private readonly episodeRepository: EpisodeRepository) {}

  async execute(input: ListEpisodesInput): Promise<PaginatedResult<Episode>> {
    const normalizedSearch = input.search?.trim();

    return this.episodeRepository.list({
      page: input.page,
      ...(normalizedSearch ? { search: normalizedSearch } : {}),
    });
  }
}

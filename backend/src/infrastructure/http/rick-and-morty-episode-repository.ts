import type { Episode } from "../../domain/entities/episode.js";
import type { PaginatedResult } from "../../domain/entities/paginated-result.js";
import type {
  EpisodeRepository,
  EpisodeWithCharacterIds,
  ListEpisodesQuery,
} from "../../domain/repositories/episode-repository.js";
import type { RickAndMortyClient } from "./rick-and-morty-client.js";

interface RickAndMortyEpisodeApiModel {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
}

interface RickAndMortyEpisodeListApiModel {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: RickAndMortyEpisodeApiModel[];
}

function toEpisode(raw: RickAndMortyEpisodeApiModel): Episode {
  return {
    id: raw.id,
    name: raw.name,
    airDate: raw.air_date,
    episodeCode: raw.episode,
  };
}

// Character URLs look like "https://rickandmortyapi.com/api/character/1".
function extractCharacterId(characterUrl: string): number {
  const match = /\/character\/(\d+)$/.exec(characterUrl);
  if (!match?.[1]) {
    throw new Error(`Unexpected character URL from the Rick and Morty API: ${characterUrl}`);
  }
  return Number(match[1]);
}

function emptyPage(page: number): PaginatedResult<Episode> {
  return {
    items: [],
    page,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  };
}

export class RickAndMortyEpisodeRepository implements EpisodeRepository {
  constructor(private readonly client: RickAndMortyClient) {}

  async list(query: ListEpisodesQuery): Promise<PaginatedResult<Episode>> {
    const params = new URLSearchParams({ page: String(query.page) });
    if (query.search) {
      params.set("name", query.search);
    }

    const raw = await this.client.get<RickAndMortyEpisodeListApiModel>(`/episode?${params.toString()}`);

    if (!raw) {
      return emptyPage(query.page);
    }

    return {
      items: raw.results.map(toEpisode),
      page: query.page,
      totalPages: raw.info.pages,
      totalCount: raw.info.count,
      hasNext: raw.info.next !== null,
      hasPrevious: raw.info.prev !== null,
    };
  }

  async findById(id: number): Promise<EpisodeWithCharacterIds | null> {
    const raw = await this.client.get<RickAndMortyEpisodeApiModel>(`/episode/${id}`);

    if (!raw) {
      return null;
    }

    return {
      ...toEpisode(raw),
      characterIds: raw.characters.map(extractCharacterId),
    };
  }
}

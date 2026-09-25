import { ListEpisodesUseCase } from "../application/use-cases/list-episodes.use-case.js";
import type { Env } from "../config/env.js";
import { FetchRickAndMortyClient } from "../infrastructure/http/rick-and-morty-client.js";
import { RickAndMortyEpisodeRepository } from "../infrastructure/http/rick-and-morty-episode-repository.js";

export interface Dependencies {
  listEpisodes: ListEpisodesUseCase;
}

export function buildDependencies(env: Env): Dependencies {
  const client = new FetchRickAndMortyClient(env.upstreamApiUrl);
  const episodeRepository = new RickAndMortyEpisodeRepository(client);

  return {
    listEpisodes: new ListEpisodesUseCase(episodeRepository),
  };
}

import { GetCharacterDetailUseCase } from "../application/use-cases/get-character-detail.use-case.js";
import { GetEpisodeDetailUseCase } from "../application/use-cases/get-episode-detail.use-case.js";
import { ListEpisodesUseCase } from "../application/use-cases/list-episodes.use-case.js";
import type { Env } from "../config/env.js";
import { RickAndMortyCharacterRepository } from "../infrastructure/http/rick-and-morty-character-repository.js";
import { FetchRickAndMortyClient } from "../infrastructure/http/rick-and-morty-client.js";
import { RickAndMortyEpisodeRepository } from "../infrastructure/http/rick-and-morty-episode-repository.js";

export interface Dependencies {
  listEpisodes: ListEpisodesUseCase;
  getEpisodeDetail: GetEpisodeDetailUseCase;
  getCharacterDetail: GetCharacterDetailUseCase;
}

export function buildDependencies(env: Env): Dependencies {
  const client = new FetchRickAndMortyClient(env.upstreamApiUrl);
  const episodeRepository = new RickAndMortyEpisodeRepository(client);
  const characterRepository = new RickAndMortyCharacterRepository(client);

  return {
    listEpisodes: new ListEpisodesUseCase(episodeRepository),
    getEpisodeDetail: new GetEpisodeDetailUseCase(episodeRepository, characterRepository),
    getCharacterDetail: new GetCharacterDetailUseCase(characterRepository),
  };
}

import type { EpisodeDetail } from "../../domain/entities/episode-detail.js";
import type { CharacterRepository } from "../../domain/repositories/character-repository.js";
import type { EpisodeRepository } from "../../domain/repositories/episode-repository.js";

export class GetEpisodeDetailUseCase {
  constructor(
    private readonly episodeRepository: EpisodeRepository,
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(id: number): Promise<EpisodeDetail | null> {
    const episode = await this.episodeRepository.findById(id);
    if (!episode) {
      return null;
    }

    const characters = await this.characterRepository.findByIds(episode.characterIds);

    return {
      id: episode.id,
      name: episode.name,
      airDate: episode.airDate,
      episodeCode: episode.episodeCode,
      // Alphabetical by name: the Rick and Morty API doesn't define an
      // inherent order for an episode's character list (see README).
      characters: [...characters].sort((a, b) => a.name.localeCompare(b.name)),
    };
  }
}

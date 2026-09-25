import type { CharacterDetail } from "../../domain/entities/character-detail.js";
import type { CharacterSummary } from "../../domain/entities/character-summary.js";
import type { CharacterRepository } from "../../domain/repositories/character-repository.js";
import type { RickAndMortyClient } from "./rick-and-morty-client.js";

interface RickAndMortyCharacterApiModel {
  id: number;
  name: string;
  image: string;
}

interface RickAndMortyCharacterDetailApiModel extends RickAndMortyCharacterApiModel {
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
}

function toCharacterSummary(raw: RickAndMortyCharacterApiModel): CharacterSummary {
  return {
    id: raw.id,
    name: raw.name,
    image: raw.image,
  };
}

function toCharacterDetail(raw: RickAndMortyCharacterDetailApiModel): CharacterDetail {
  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    species: raw.species,
    type: raw.type,
    gender: raw.gender,
    origin: raw.origin.name,
    location: raw.location.name,
    image: raw.image,
  };
}

export class RickAndMortyCharacterRepository implements CharacterRepository {
  constructor(private readonly client: RickAndMortyClient) {}

  async findByIds(ids: number[]): Promise<CharacterSummary[]> {
    if (ids.length === 0) {
      return [];
    }

    // A single id returns one object; several comma-separated ids return an
    // array — one upstream call either way.
    const raw = await this.client.get<RickAndMortyCharacterApiModel | RickAndMortyCharacterApiModel[]>(
      `/character/${ids.join(",")}`,
    );

    if (!raw) {
      return [];
    }

    return (Array.isArray(raw) ? raw : [raw]).map(toCharacterSummary);
  }

  async findById(id: number): Promise<CharacterDetail | null> {
    const raw = await this.client.get<RickAndMortyCharacterDetailApiModel>(`/character/${id}`);

    if (!raw) {
      return null;
    }

    return toCharacterDetail(raw);
  }
}

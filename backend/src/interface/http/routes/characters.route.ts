import type { FastifyInstance } from "fastify";
import type { GetCharacterDetailUseCase } from "../../../application/use-cases/get-character-detail.use-case.js";
import { UpstreamUnavailableError } from "../../../domain/errors/upstream-unavailable-error.js";

interface CharactersRouteOptions {
  getCharacterDetail: GetCharacterDetailUseCase;
}

interface CharacterDetailParams {
  id: string;
}

export async function charactersRoute(app: FastifyInstance, opts: CharactersRouteOptions): Promise<void> {
  app.get<{ Params: CharacterDetailParams }>("/characters/:id", async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return reply.status(400).send({ error: "id must be a positive integer" });
    }

    try {
      const character = await opts.getCharacterDetail.execute(id);

      if (!character) {
        return reply.status(404).send({ error: "Character not found" });
      }

      return {
        id: character.id,
        name: character.name,
        status: character.status,
        species: character.species,
        type: character.type,
        gender: character.gender,
        origin: character.origin,
        location: character.location,
        image: character.image,
      };
    } catch (error) {
      if (error instanceof UpstreamUnavailableError) {
        return reply.status(502).send({ error: "Failed to reach the Rick and Morty API" });
      }
      throw error;
    }
  });
}

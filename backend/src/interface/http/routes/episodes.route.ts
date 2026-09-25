import type { FastifyInstance } from "fastify";
import type { GetEpisodeDetailUseCase } from "../../../application/use-cases/get-episode-detail.use-case.js";
import type { ListEpisodesUseCase } from "../../../application/use-cases/list-episodes.use-case.js";
import { UpstreamUnavailableError } from "../../../domain/errors/upstream-unavailable-error.js";

interface EpisodesRouteOptions {
  listEpisodes: ListEpisodesUseCase;
  getEpisodeDetail: GetEpisodeDetailUseCase;
}

interface ListEpisodesQuerystring {
  search?: string;
  page?: string;
}

const querystringSchema = {
  type: "object",
  properties: {
    search: { type: "string" },
    page: { type: "string" },
  },
  additionalProperties: false,
} as const;

interface EpisodeDetailParams {
  id: string;
}

export async function episodesRoute(app: FastifyInstance, opts: EpisodesRouteOptions): Promise<void> {
  app.get<{ Querystring: ListEpisodesQuerystring }>(
    "/episodes",
    { schema: { querystring: querystringSchema } },
    async (request, reply) => {
      const { search, page: rawPage } = request.query;

      let page = 1;
      if (rawPage !== undefined) {
        page = Number(rawPage);
        if (!Number.isSafeInteger(page) || page < 1) {
          return reply.status(400).send({ error: "page must be a positive integer" });
        }
      }

      try {
        const result = await opts.listEpisodes.execute({
          page,
          ...(search !== undefined ? { search } : {}),
        });

        return {
          episodes: result.items,
          page: result.page,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          hasNext: result.hasNext,
          hasPrevious: result.hasPrevious,
        };
      } catch (error) {
        if (error instanceof UpstreamUnavailableError) {
          return reply.status(502).send({ error: "Failed to reach the Rick and Morty API" });
        }
        throw error;
      }
    },
  );

  app.get<{ Params: EpisodeDetailParams }>("/episodes/:id", async (request, reply) => {
    const id = Number(request.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return reply.status(400).send({ error: "id must be a positive integer" });
    }

    try {
      const episode = await opts.getEpisodeDetail.execute(id);

      if (!episode) {
        return reply.status(404).send({ error: "Episode not found" });
      }

      return {
        id: episode.id,
        name: episode.name,
        airDate: episode.airDate,
        episodeCode: episode.episodeCode,
        characters: episode.characters,
      };
    } catch (error) {
      if (error instanceof UpstreamUnavailableError) {
        return reply.status(502).send({ error: "Failed to reach the Rick and Morty API" });
      }
      throw error;
    }
  });
}

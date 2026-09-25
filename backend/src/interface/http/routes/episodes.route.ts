import type { FastifyInstance } from "fastify";
import type { ListEpisodesUseCase } from "../../../application/use-cases/list-episodes.use-case.js";
import { UpstreamUnavailableError } from "../../../domain/errors/upstream-unavailable-error.js";

interface EpisodesRouteOptions {
  listEpisodes: ListEpisodesUseCase;
}

interface ListEpisodesQuerystring {
  search?: string;
  page?: string;
}

export async function episodesRoute(app: FastifyInstance, opts: EpisodesRouteOptions): Promise<void> {
  app.get<{ Querystring: ListEpisodesQuerystring }>("/episodes", async (request, reply) => {
    const { search, page: rawPage } = request.query;

    let page = 1;
    if (rawPage !== undefined) {
      page = Number(rawPage);
      if (!Number.isInteger(page) || page < 1) {
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
  });
}

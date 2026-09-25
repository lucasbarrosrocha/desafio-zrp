import { describe, expect, it, vi } from "vitest";
import { ListEpisodesUseCase } from "../../src/application/use-cases/list-episodes.use-case.js";
import type { Episode } from "../../src/domain/entities/episode.js";
import type { PaginatedResult } from "../../src/domain/entities/paginated-result.js";
import type { EpisodeRepository } from "../../src/domain/repositories/episode-repository.js";

function emptyPage(page: number): PaginatedResult<Episode> {
  return { items: [], page, totalPages: 0, totalCount: 0, hasNext: false, hasPrevious: false };
}

describe("ListEpisodesUseCase", () => {
  it("trims the search term before delegating to the repository", async () => {
    const list = vi.fn().mockResolvedValue(emptyPage(1));
    const useCase = new ListEpisodesUseCase({ list } satisfies EpisodeRepository);

    await useCase.execute({ search: "  pilot  ", page: 1 });

    expect(list).toHaveBeenCalledWith({ search: "pilot", page: 1 });
  });

  it("treats a blank search term as no filter", async () => {
    const list = vi.fn().mockResolvedValue(emptyPage(2));
    const useCase = new ListEpisodesUseCase({ list } satisfies EpisodeRepository);

    await useCase.execute({ search: "   ", page: 2 });

    expect(list).toHaveBeenCalledWith({ search: undefined, page: 2 });
  });

  it("omits search entirely when none was provided", async () => {
    const list = vi.fn().mockResolvedValue(emptyPage(1));
    const useCase = new ListEpisodesUseCase({ list } satisfies EpisodeRepository);

    await useCase.execute({ page: 1 });

    expect(list).toHaveBeenCalledWith({ search: undefined, page: 1 });
  });

  it("returns whatever the repository resolves", async () => {
    const page: PaginatedResult<Episode> = {
      items: [{ id: 1, name: "Pilot", airDate: "December 2, 2013", episodeCode: "S01E01" }],
      page: 1,
      totalPages: 1,
      totalCount: 1,
      hasNext: false,
      hasPrevious: false,
    };
    const list = vi.fn().mockResolvedValue(page);
    const useCase = new ListEpisodesUseCase({ list } satisfies EpisodeRepository);

    const result = await useCase.execute({ page: 1 });

    expect(result).toBe(page);
  });
});

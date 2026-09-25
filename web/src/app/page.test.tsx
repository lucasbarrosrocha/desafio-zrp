import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EpisodesPage } from "@/lib/types/episode";

const { listEpisodes } = vi.hoisted(() => ({ listEpisodes: vi.fn() }));

vi.mock("@/lib/api/episodes", () => ({ listEpisodes }));

import Home from "./page";

function episodesPage(overrides: Partial<EpisodesPage> = {}): EpisodesPage {
  return {
    episodes: [],
    page: 1,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
    ...overrides,
  };
}

describe("Home page", () => {
  beforeEach(() => {
    listEpisodes.mockReset();
  });

  it("renders the project heading", async () => {
    listEpisodes.mockResolvedValue(episodesPage());

    const ui = await Home({ params: Promise.resolve({}), searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByRole("heading", { name: "Desafio ZRP" })).toBeInTheDocument();
  });

  it("renders an episode card for each result", async () => {
    listEpisodes.mockResolvedValue(
      episodesPage({
        episodes: [{ id: 1, name: "Pilot", airDate: "December 2, 2013", episodeCode: "S01E01" }],
      }),
    );

    const ui = await Home({ params: Promise.resolve({}), searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByText("Pilot")).toBeInTheDocument();
    expect(screen.getByText("S01E01")).toBeInTheDocument();
  });

  it("shows an empty state when there are no results", async () => {
    listEpisodes.mockResolvedValue(episodesPage());

    const ui = await Home({ params: Promise.resolve({}), searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByText("No episodes found.")).toBeInTheDocument();
  });

  it("passes the search term from the URL to the search input and the API call", async () => {
    listEpisodes.mockResolvedValue(episodesPage());

    const ui = await Home({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({ search: "pilot" }),
    });
    render(ui);

    expect(screen.getByRole("searchbox", { name: "Search episodes" })).toHaveValue("pilot");
    expect(listEpisodes).toHaveBeenCalledWith({ search: "pilot", page: 1 });
  });

  it("parses the page param from the URL", async () => {
    listEpisodes.mockResolvedValue(episodesPage({ page: 2, totalPages: 3 }));

    const ui = await Home({ params: Promise.resolve({}), searchParams: Promise.resolve({ page: "2" }) });
    render(ui);

    expect(listEpisodes).toHaveBeenCalledWith({ search: undefined, page: 2 });
  });

  it("falls back to page 1 for an invalid page param", async () => {
    listEpisodes.mockResolvedValue(episodesPage());

    const ui = await Home({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({ page: "not-a-number" }),
    });
    render(ui);

    expect(listEpisodes).toHaveBeenCalledWith({ search: undefined, page: 1 });
  });

  it("renders pagination controls when there is more than one page", async () => {
    listEpisodes.mockResolvedValue(episodesPage({ page: 1, totalPages: 3 }));

    const ui = await Home({ params: Promise.resolve({}), searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/?page=2");
  });
});

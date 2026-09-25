import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EpisodeDetail } from "@/lib/types/episode";

const { getEpisodeDetail, notFound } = vi.hoisted(() => ({
  getEpisodeDetail: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/api/episodes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/episodes")>();
  return { ...actual, getEpisodeDetail };
});
vi.mock("next/navigation", () => ({ notFound }));

import { BackendApiError } from "@/lib/api/episodes";
import EpisodeDetailPage from "./page";

function episodeDetail(overrides: Partial<EpisodeDetail> = {}): EpisodeDetail {
  return {
    id: 1,
    name: "Pilot",
    airDate: "December 2, 2013",
    episodeCode: "S01E01",
    characters: [],
    ...overrides,
  };
}

describe("EpisodeDetailPage", () => {
  beforeEach(() => {
    getEpisodeDetail.mockReset();
    notFound.mockClear();
  });

  it("renders the episode's fields and its characters", async () => {
    getEpisodeDetail.mockResolvedValue(
      episodeDetail({
        characters: [{ id: 1, name: "Rick Sanchez", image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg" }],
      }),
    );

    const ui = await EpisodeDetailPage({
      params: Promise.resolve({ id: "1" }),
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(screen.getByRole("heading", { name: "Pilot" })).toBeInTheDocument();
    expect(screen.getByText(/S01E01/)).toBeInTheDocument();
    expect(screen.getByText(/December 2, 2013/)).toBeInTheDocument();
    expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
    expect(getEpisodeDetail).toHaveBeenCalledWith(1);
  });

  it("shows an empty state when the episode has no characters", async () => {
    getEpisodeDetail.mockResolvedValue(episodeDetail({ characters: [] }));

    const ui = await EpisodeDetailPage({
      params: Promise.resolve({ id: "1" }),
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(screen.getByText("No characters found for this episode.")).toBeInTheDocument();
  });

  it("renders a disabled 'View details' button per character (no modal yet)", async () => {
    getEpisodeDetail.mockResolvedValue(
      episodeDetail({
        characters: [{ id: 1, name: "Rick Sanchez", image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg" }],
      }),
    );

    const ui = await EpisodeDetailPage({
      params: Promise.resolve({ id: "1" }),
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(screen.getByRole("button", { name: "View details" })).toBeDisabled();
  });

  it("links back to the list, preserving search and page from the URL", async () => {
    getEpisodeDetail.mockResolvedValue(episodeDetail());

    const ui = await EpisodeDetailPage({
      params: Promise.resolve({ id: "1" }),
      searchParams: Promise.resolve({ search: "pilot", page: "2" }),
    });
    render(ui);

    expect(screen.getByRole("link", { name: /Back to episodes/ })).toHaveAttribute(
      "href",
      "/?search=pilot&page=2",
    );
  });

  it("links back to a plain list URL when there's no search/page context", async () => {
    getEpisodeDetail.mockResolvedValue(episodeDetail());

    const ui = await EpisodeDetailPage({
      params: Promise.resolve({ id: "1" }),
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(screen.getByRole("link", { name: /Back to episodes/ })).toHaveAttribute("href", "/");
  });

  it("calls notFound for a non-numeric id without hitting the backend", async () => {
    await expect(
      EpisodeDetailPage({ params: Promise.resolve({ id: "abc" }), searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalledOnce();
    expect(getEpisodeDetail).not.toHaveBeenCalled();
  });

  it("calls notFound when the backend reports the episode doesn't exist", async () => {
    getEpisodeDetail.mockRejectedValue(new BackendApiError("Backend API responded with status 404", 404));

    await expect(
      EpisodeDetailPage({ params: Promise.resolve({ id: "999" }), searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalledOnce();
  });

  it("propagates a non-404 failure instead of swallowing it", async () => {
    getEpisodeDetail.mockRejectedValue(new BackendApiError("Backend API responded with status 502", 502));

    await expect(
      EpisodeDetailPage({ params: Promise.resolve({ id: "1" }), searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("Backend API responded with status 502");

    expect(notFound).not.toHaveBeenCalled();
  });
});

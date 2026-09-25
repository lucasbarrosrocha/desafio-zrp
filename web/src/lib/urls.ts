interface EpisodeListQuery {
  search?: string;
  page?: number;
}

function episodeListQueryString({ search, page }: EpisodeListQuery): string {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  if (page) {
    params.set("page", String(page));
  }
  return params.size ? `?${params.toString()}` : "";
}

export function buildEpisodeListHref(query: EpisodeListQuery = {}): string {
  return `/${episodeListQueryString(query)}`;
}

export function buildEpisodeDetailHref(id: number, query: EpisodeListQuery = {}): string {
  return `/episodes/${id}${episodeListQueryString(query)}`;
}

export interface Episode {
  id: number;
  name: string;
  airDate: string;
  episodeCode: string;
}

export interface EpisodesPage {
  episodes: Episode[];
  page: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

import "server-only";
import type { EpisodesPage } from "@/lib/types/episode";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:3001";

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "BackendApiError";
  }
}

export interface ListEpisodesParams {
  search?: string;
  page?: number;
}

export async function listEpisodes({ search, page }: ListEpisodesParams): Promise<EpisodesPage> {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  if (page) {
    params.set("page", String(page));
  }

  const query = params.size ? `?${params.toString()}` : "";
  let response: Response;

  try {
    response = await fetch(`${BACKEND_API_URL}/episodes${query}`, {
      next: { revalidate: 3600 },
    });
  } catch (error) {
    throw new BackendApiError("Failed to reach the backend API", undefined, { cause: error });
  }

  if (!response.ok) {
    throw new BackendApiError(`Backend API responded with status ${response.status}`, response.status);
  }

  return (await response.json()) as EpisodesPage;
}

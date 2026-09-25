import { UpstreamUnavailableError } from "../../domain/errors/upstream-unavailable-error.js";

/**
 * Thin wrapper around the upstream Rick and Morty API.
 *
 * The upstream API responds 404 for both "no results for this filter" and
 * "page out of range" (same body shape as a genuine not-found) — callers get
 * `null` for that case and decide what it means in their own context, instead
 * of this client guessing.
 */
export interface RickAndMortyClient {
  get<T>(path: string): Promise<T | null>;
}

export class FetchRickAndMortyClient implements RickAndMortyClient {
  constructor(private readonly baseUrl: string) {}

  async get<T>(path: string): Promise<T | null> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`);
    } catch (error) {
      throw new UpstreamUnavailableError("Failed to reach the Rick and Morty API", { cause: error });
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new UpstreamUnavailableError(`Rick and Morty API responded with status ${response.status}`);
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new UpstreamUnavailableError("Rick and Morty API returned a malformed response", { cause: error });
    }
  }
}

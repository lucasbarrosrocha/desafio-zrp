"use server";

import type { CharacterDetail } from "@/lib/types/character";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export type GetCharacterDetailResult = { ok: true; character: CharacterDetail } | { ok: false; status?: number };

/**
 * A Server Action rather than a plain `server-only` fetch: the character
 * modal fetches on demand when a user opens it (a Client Component event),
 * not during the episode page's own server render. Returns a plain result
 * instead of throwing so the client can distinguish "not found" from a
 * generic failure without Next's production error redaction losing the
 * status code.
 */
export async function getCharacterDetail(id: number): Promise<GetCharacterDetailResult> {
  let response: Response;

  try {
    response = await fetch(`${BACKEND_API_URL}/characters/${id}`, {
      next: { revalidate: 3600 },
    });
  } catch {
    return { ok: false };
  }

  if (!response.ok) {
    return { ok: false, status: response.status };
  }

  return { ok: true, character: (await response.json()) as CharacterDetail };
}

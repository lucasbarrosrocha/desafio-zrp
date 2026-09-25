import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterListItem } from "@/components/episodes/character-list-item";
import { buttonVariants } from "@/components/ui/button";
import { BackendApiError, getEpisodeDetail } from "@/lib/api/episodes";
import { buildEpisodeListHref } from "@/lib/urls";

function parseId(rawId: string): number | null {
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id >= 1 ? id : null;
}

export default async function EpisodeDetailPage({ params, searchParams }: PageProps<"/episodes/[id]">) {
  const [{ id: rawId }, resolvedSearchParams] = await Promise.all([params, searchParams]);

  const id = parseId(rawId);
  if (id === null) {
    notFound();
  }

  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;
  const page = typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : undefined;
  const backHref = buildEpisodeListHref({ search, page: page ? Number(page) : undefined });

  let episode;
  try {
    episode = await getEpisodeDetail(id);
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <Link href={backHref} className={buttonVariants({ variant: "outline", className: "self-start" })}>
        ← Back to episodes
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{episode.name}</h1>
        <p className="text-muted-foreground">
          {episode.episodeCode} · Aired {episode.airDate}
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Characters</h2>
        {episode.characters.length === 0 ? (
          <p className="text-muted-foreground">No characters found for this episode.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {episode.characters.map((character) => (
              <li key={character.id}>
                <CharacterListItem character={character} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

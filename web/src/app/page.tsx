import { EpisodeCard } from "@/components/episodes/episode-card";
import { PaginationControls } from "@/components/episodes/pagination-controls";
import { SearchForm } from "@/components/episodes/search-form";
import { listEpisodes } from "@/lib/api/episodes";

function parsePage(rawPage: string | undefined): number {
  if (!rawPage) {
    return 1;
  }
  const page = Number(rawPage);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const page = parsePage(typeof params.page === "string" ? params.page : undefined);

  const result = await listEpisodes({ search, page });

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Desafio ZRP</h1>
        <p className="max-w-md text-muted-foreground">Rick and Morty episode explorer.</p>
      </div>

      <SearchForm defaultValue={search ?? ""} />

      {result.episodes.length === 0 ? (
        <p className="text-muted-foreground">No episodes found.</p>
      ) : (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {result.episodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      )}

      <PaginationControls page={result.page} totalPages={result.totalPages} search={search} />
    </main>
  );
}

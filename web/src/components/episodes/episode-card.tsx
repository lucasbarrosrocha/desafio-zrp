import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Episode } from "@/lib/types/episode";
import { buildEpisodeDetailHref } from "@/lib/urls";

interface EpisodeCardProps {
  episode: Episode;
  search?: string;
  page: number;
}

export function EpisodeCard({ episode, search, page }: EpisodeCardProps) {
  return (
    <Link
      href={buildEpisodeDetailHref(episode.id, { search, page })}
      className="block rounded-xl transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card>
        <CardHeader>
          <CardTitle>{episode.name}</CardTitle>
          <CardDescription>{episode.episodeCode}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aired {episode.airDate}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

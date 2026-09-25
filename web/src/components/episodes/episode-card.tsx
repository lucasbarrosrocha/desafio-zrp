import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Episode } from "@/lib/types/episode";

interface EpisodeCardProps {
  episode: Episode;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{episode.name}</CardTitle>
        <CardDescription>{episode.episodeCode}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Aired {episode.airDate}</p>
      </CardContent>
    </Card>
  );
}

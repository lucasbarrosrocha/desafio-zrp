import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Character } from "@/lib/types/episode";

interface CharacterListItemProps {
  character: Character;
}

export function CharacterListItem({ character }: CharacterListItemProps) {
  return (
    <Card className="flex-row items-center gap-3 p-3">
      <Image
        src={character.image}
        alt=""
        width={48}
        height={48}
        className="size-12 shrink-0 rounded-full object-cover"
      />
      <CardContent className="flex flex-1 items-center justify-between gap-3 px-0">
        <span className="font-medium">{character.name}</span>
        {/* Modal wiring lands in a later phase — the button is disabled until then. */}
        <Button variant="outline" size="sm" disabled>
          View details
        </Button>
      </CardContent>
    </Card>
  );
}

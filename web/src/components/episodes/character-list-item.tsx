import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Character } from "@/lib/types/episode";
import { CharacterModal } from "./character-modal";

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
        <CharacterModal characterId={character.id} characterName={character.name} />
      </CardContent>
    </Card>
  );
}

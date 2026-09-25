"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCharacterDetail } from "@/lib/actions/get-character-detail";
import type { CharacterDetail } from "@/lib/types/character";

interface CharacterModalProps {
  characterId: number;
  characterName: string;
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "success"; character: CharacterDetail };

export function CharacterModal({ characterId, characterName }: CharacterModalProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });

  async function load() {
    setState({ status: "loading" });
    const result = await getCharacterDetail(characterId);
    if (!result.ok) {
      setState(result.status === 404 ? { status: "not-found" } : { status: "error" });
      return;
    }
    setState({ status: "success", character: result.character });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && state.status === "idle") {
      void load();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>View details</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{characterName}</DialogTitle>
        </DialogHeader>
        {state.status === "loading" && (
          <p role="status" className="text-muted-foreground">
            Loading character…
          </p>
        )}
        {state.status === "not-found" && <p className="text-muted-foreground">Character not found.</p>}
        {state.status === "error" && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-muted-foreground">Could not load this character. Please try again.</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        )}
        {state.status === "success" && <CharacterDetailView character={state.character} />}
      </DialogContent>
    </Dialog>
  );
}

function CharacterDetailView({ character }: { character: CharacterDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <Image
        src={character.image}
        alt=""
        width={96}
        height={96}
        className="size-24 self-center rounded-full object-cover"
      />
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">Status</dt>
        <dd>{character.status}</dd>
        <dt className="text-muted-foreground">Species</dt>
        <dd>{character.species}</dd>
        {character.type ? (
          <>
            <dt className="text-muted-foreground">Type</dt>
            <dd>{character.type}</dd>
          </>
        ) : null}
        <dt className="text-muted-foreground">Gender</dt>
        <dd>{character.gender}</dd>
        <dt className="text-muted-foreground">Origin</dt>
        <dd>{character.origin}</dd>
        <dt className="text-muted-foreground">Location</dt>
        <dd>{character.location}</dd>
      </dl>
    </div>
  );
}

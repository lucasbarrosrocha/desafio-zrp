import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Desafio ZRP</h1>
      <p className="max-w-md text-muted-foreground">
        Rick and Morty episode explorer — web client. The episode list is coming in the next
        phase.
      </p>
      <Button disabled>Browse episodes</Button>
    </div>
  );
}

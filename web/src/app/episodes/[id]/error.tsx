"use client";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">We couldn&apos;t load this episode right now. Please try again.</p>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}

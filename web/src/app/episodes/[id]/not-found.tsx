import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function EpisodeNotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Episode not found</h1>
      <p className="text-muted-foreground">This episode doesn&apos;t exist. It may have been mistyped or removed.</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to episodes
      </Link>
    </main>
  );
}

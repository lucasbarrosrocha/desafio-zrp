import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  defaultValue: string;
}

/**
 * Plain server-rendered GET form: submitting it is a normal browser
 * navigation to `/?search=...`, so no client-side JavaScript is needed to
 * keep the search term in the URL (which is also what makes back-navigation
 * preserve it).
 */
export function SearchForm({ defaultValue }: SearchFormProps) {
  return (
    <form action="/" method="get" role="search" className="flex w-full max-w-md gap-2">
      <Input
        type="search"
        name="search"
        placeholder="Search episodes…"
        defaultValue={defaultValue}
        aria-label="Search episodes"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}

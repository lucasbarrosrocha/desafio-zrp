import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchForm } from "./search-form";

describe("SearchForm", () => {
  it("renders a GET form targeting the home page", () => {
    render(<SearchForm defaultValue="" />);

    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("method", "get");
    expect(form).toHaveAttribute("action", "/");
  });

  it("pre-fills the input with the current search term", () => {
    render(<SearchForm defaultValue="pilot" />);

    expect(screen.getByRole("searchbox", { name: "Search episodes" })).toHaveValue("pilot");
  });
});

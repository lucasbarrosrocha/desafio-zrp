import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaginationControls } from "./pagination-controls";

describe("PaginationControls", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(<PaginationControls page={1} totalPages={1} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("disables Previous on the first page and links Next", () => {
    render(<PaginationControls page={1} totalPages={3} search="rick" />);

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/?search=rick&page=2");
  });

  it("disables Next on the last page and links Previous", () => {
    render(<PaginationControls page={3} totalPages={3} />);

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/?page=2");
  });

  it("links both directions on a middle page", () => {
    render(<PaginationControls page={2} totalPages={3} />);

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/?page=1");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/?page=3");
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GetCharacterDetailResult } from "@/lib/actions/get-character-detail";
import { CharacterModal } from "./character-modal";

const { getCharacterDetail } = vi.hoisted(() => ({ getCharacterDetail: vi.fn() }));

vi.mock("@/lib/actions/get-character-detail", () => ({ getCharacterDetail }));

const character = {
  id: 1,
  name: "Rick Sanchez",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  origin: "Earth (C-137)",
  location: "Citadel of Ricks",
  image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
};

describe("CharacterModal", () => {
  beforeEach(() => {
    getCharacterDetail.mockReset();
  });

  it("is closed by default and does not fetch until opened", () => {
    render(<CharacterModal characterId={1} characterName="Rick Sanchez" />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(getCharacterDetail).not.toHaveBeenCalled();
  });

  it("shows a loading state while fetching, then the character detail", async () => {
    const user = userEvent.setup();
    let resolveFetch!: (result: GetCharacterDetailResult) => void;
    getCharacterDetail.mockReturnValue(
      new Promise<GetCharacterDetailResult>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    render(<CharacterModal characterId={1} characterName="Rick Sanchez" />);
    await user.click(screen.getByRole("button", { name: "View details" }));

    expect(screen.getByRole("status")).toHaveTextContent("Loading character…");

    resolveFetch({ ok: true, character });
    await waitFor(() => expect(screen.getByText("Alive")).toBeInTheDocument());

    expect(getCharacterDetail).toHaveBeenCalledWith(1);
    expect(screen.getByRole("dialog", { name: "Rick Sanchez" })).toBeInTheDocument();
    expect(screen.getByText("Human")).toBeInTheDocument();
    expect(screen.getByText("Earth (C-137)")).toBeInTheDocument();
    expect(screen.getByText("Citadel of Ricks")).toBeInTheDocument();
    // Empty `type` from the API is omitted rather than shown as a blank row.
    expect(screen.queryByText("Type")).not.toBeInTheDocument();
  });

  it("shows a not-found message for a 404", async () => {
    const user = userEvent.setup();
    getCharacterDetail.mockResolvedValue({ ok: false, status: 404 });

    render(<CharacterModal characterId={999} characterName="Missing" />);
    await user.click(screen.getByRole("button", { name: "View details" }));

    await waitFor(() => expect(screen.getByText("Character not found.")).toBeInTheDocument());
  });

  it("shows an error state with a working retry button for other failures", async () => {
    const user = userEvent.setup();
    getCharacterDetail.mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, character });

    render(<CharacterModal characterId={1} characterName="Rick Sanchez" />);
    await user.click(screen.getByRole("button", { name: "View details" }));

    await waitFor(() =>
      expect(screen.getByText("Could not load this character. Please try again.")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(screen.getByText("Alive")).toBeInTheDocument());
    expect(getCharacterDetail).toHaveBeenCalledTimes(2);
  });

  it("closes when the close button is clicked and does not refetch on reopen", async () => {
    const user = userEvent.setup();
    getCharacterDetail.mockResolvedValue({ ok: true, character });

    render(<CharacterModal characterId={1} characterName="Rick Sanchez" />);
    await user.click(screen.getByRole("button", { name: "View details" }));
    await waitFor(() => expect(screen.getByText("Alive")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "View details" }));

    expect(screen.getByText("Alive")).toBeInTheDocument();
    expect(getCharacterDetail).toHaveBeenCalledTimes(1);
  });
});

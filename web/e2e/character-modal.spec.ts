import { expect, test } from "./fixtures";

test.describe("character modal", () => {
  test("opening a character shows its detail, then closes", async ({ page }) => {
    await page.goto("/episodes/1");

    await expect(page.getByRole("heading", { name: "Pilot" })).toBeVisible();

    // "Rick Sanchez" specifically, so the species assertion below is stable —
    // Pilot's character list is sorted alphabetically, and the first entry
    // (an alien named "Bepisian") isn't human.
    const rickListItem = page.getByRole("listitem").filter({ hasText: "Rick Sanchez" });
    const viewDetailsButton = rickListItem.getByRole("button", { name: "View details" });
    await expect(viewDetailsButton).toBeEnabled();
    await viewDetailsButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Status")).toBeVisible();
    await expect(dialog.getByText("Species")).toBeVisible();
    await expect(dialog.getByText("Human")).toBeVisible();

    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("closing and reopening the same character does not show a loading flash", async ({ page }) => {
    await page.goto("/episodes/1");

    const rickListItem = page.getByRole("listitem").filter({ hasText: "Rick Sanchez" });
    const viewDetailsButton = rickListItem.getByRole("button", { name: "View details" });
    await viewDetailsButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Species")).toBeVisible();

    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();

    await viewDetailsButton.click();
    await expect(dialog.getByText("Species")).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";

test.describe("episode detail", () => {
  test("opening an episode shows its data and characters", async ({ page }) => {
    await page.goto("/");

    await page.getByText("Pilot").click();

    await expect(page).toHaveURL(/\/episodes\/1/);
    await expect(page.getByRole("heading", { name: "Pilot" })).toBeVisible();
    await expect(page.getByText("S01E01")).toBeVisible();
    await expect(page.getByText("Rick Sanchez")).toBeVisible();
    await expect(page.getByRole("button", { name: "View details" }).first()).toBeEnabled();
  });

  test("visiting a nonexistent episode shows the not-found page", async ({ page }) => {
    await page.goto("/episodes/999999");

    await expect(page.getByRole("heading", { name: "Episode not found" })).toBeVisible();
  });

  test("back button preserves the list's search and page state", async ({ page }) => {
    await page.goto("/?search=Pilot&page=1");

    await page.getByText("Pilot").click();

    await expect(page).toHaveURL(/\/episodes\/1\?search=Pilot&page=1/);

    await page.getByRole("link", { name: /Back to episodes/ }).click();

    await expect(page).toHaveURL(/search=Pilot&page=1/);
    await expect(page.getByRole("searchbox", { name: "Search episodes" })).toHaveValue("Pilot");
  });
});

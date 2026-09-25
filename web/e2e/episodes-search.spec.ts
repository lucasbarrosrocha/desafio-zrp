import { expect, test } from "@playwright/test";

test.describe("episode list and search", () => {
  test("lists episodes on load", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Desafio ZRP" })).toBeVisible();
    await expect(page.getByText("Pilot")).toBeVisible();
  });

  test("searching filters the list and updates the URL", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("searchbox", { name: "Search episodes" }).fill("total rickall");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL(/search=total\+rickall/);
    await expect(page.getByText("Total Rickall")).toBeVisible();
  });

  test("searching for something that doesn't exist shows the empty state", async ({ page }) => {
    await page.goto("/?search=zzzznonexistentepisode123");

    await expect(page.getByText("No episodes found.")).toBeVisible();
  });

  test("pagination navigates forward and browser back preserves the search state", async ({ page }) => {
    await page.goto("/?search=rick");

    await expect(page.getByRole("navigation", { name: "Pagination" })).toBeVisible();
    await page.getByRole("link", { name: "Next" }).click();

    await expect(page).toHaveURL(/search=rick&page=2/);

    await page.goBack();

    await expect(page).toHaveURL(/search=rick/);
    await expect(page.getByRole("searchbox", { name: "Search episodes" })).toHaveValue("rick");
  });
});

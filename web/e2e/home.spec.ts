import { test, expect } from "@playwright/test";

test("home page loads and shows the project heading", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Desafio ZRP" })).toBeVisible();
});

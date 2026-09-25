import { test as base, expect } from "@playwright/test";

/**
 * Fails the test if the browser logs a console error or an uncaught page
 * error during the run — e.g. the Base UI "expected a native <button>"
 * warning that a `Button` wrapping a `Link` via the `render` prop used to
 * throw on every render of the pagination controls and the episode detail
 * back link. Plain `@playwright/test` never asserted on this, so it went
 * unnoticed for several phases.
 */
export const test = base.extend<{ forbidConsoleErrors: void }>({
  forbidConsoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });
      page.on("pageerror", (err) => {
        errors.push(err.message);
      });

      await use();

      expect(errors, `Unexpected browser console error(s):\n${errors.join("\n\n")}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

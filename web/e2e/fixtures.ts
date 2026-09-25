import { test as base, expect } from "@playwright/test";

// React's generic "an error was thrown during a Server Component render"
// message — the details are redacted in production by design (see
// https://react.dev/errors/441). This fires whenever our own error.tsx
// boundary catches a real upstream failure (e.g. the live Rick and Morty
// API blipping mid-test), which is expected, correct behavior, not a bug —
// unlike every other console error, which isn't expected.
const EXPECTED_SERVER_COMPONENT_ERROR = /Minified React error #441/;

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
        if (msg.type() === "error" && !EXPECTED_SERVER_COMPONENT_ERROR.test(msg.text())) {
          errors.push(msg.text());
        }
      });
      page.on("pageerror", (err) => {
        if (!EXPECTED_SERVER_COMPONENT_ERROR.test(err.message)) {
          errors.push(err.message);
        }
      });

      await use();

      expect(errors, `Unexpected browser console error(s):\n${errors.join("\n\n")}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

import { test as base, expect, type Page } from "@playwright/test";

/** Fails the test on any uncaught page error or console error. */
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`);
    });
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByRole("heading", { name: "OPERATION SINDOOR" })).toBeVisible();
    await use(page);
    expect(errors, errors.join("\n")).toEqual([]);
  },
});

export { expect };

export async function openModule(page: Page, label: string) {
  await page.locator("nav button", { hasText: label }).click();
}

export async function selectEvent(page: Page, id: string) {
  await page.locator(`[data-evt="${id}"]`).click();
}

export const clock = (page: Page) => page.locator("header .mono").first();
export const infoTitle = (page: Page) => page.locator("aside").last().locator("h3");

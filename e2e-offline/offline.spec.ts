import { test, expect, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const file = readdirSync("dist-offline").find((f) => /^operation-sindoor-v.*\.html$/.test(f));
if (!file) throw new Error("Run `npm run build:offline` first");
const url = pathToFileURL(resolve("dist-offline", file)).href;

async function open(page: Page) {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("request", (r) => !r.url().startsWith("file:") && !r.url().startsWith("data:") && !r.url().startsWith("blob:") && requests.push(r.url()));
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "OPERATION SINDOOR" })).toBeVisible();
  return { errors, requests };
}

test("opens from disk with no network: map, relief, boundaries and symbols render", async ({ page }) => {
  const { errors, requests } = await open(page);
  await expect.poll(() => page.locator(".leaflet-base-fills-pane path").count()).toBeGreaterThan(0);
  const relief = page.locator(".leaflet-relief-pane img");
  await expect(relief).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect.poll(() => relief.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBe(1680);
  await expect(page.locator(".contested-label")).toHaveCount(6);
  // Inactive markers are grouped at the opening zoom: count single markers plus the members of each group.
  const singles = await page.locator(".leaflet-marker-icon svg").count();
  const grouped = (await page.locator(".marker-cluster-badge").allTextContents()).reduce((n, t) => n + Number(t), 0);
  expect(singles + grouped).toBeGreaterThan(50);
  expect(errors).toEqual([]);
  expect(requests, "no network requests in the offline edition").toEqual([]);
});

test("every module loads (lazy modules are inlined)", async ({ page }) => {
  const { errors } = await open(page);
  for (const m of ["Campaign Overview", "Force & Weapons", "Damage Assessment", "Escalation Matrix", "After-Action", "Source Management", "Methods & Data"]) {
    await page.locator("nav button", { hasText: m }).click();
    await expect(page.locator("main .label-caps").first()).not.toHaveText("Loading module…");
    await expect(page.locator("main")).not.toContainText("This module hit a runtime error");
  }
  expect(errors).toEqual([]);
});

test("briefing, selection and PDF export work offline", async ({ page }) => {
  const { errors } = await open(page);
  await page.getByRole("button", { name: "Guided briefing" }).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("region", { name: "Guided briefing" }).locator("h2")).toHaveText("Non-military measures");
  await page.keyboard.press("Escape");
  await page.locator("nav button", { hasText: "Escalation Matrix" }).click();
  const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Matrix PDF" }).click()]);
  expect(pdf.suggestedFilename()).toBe("sindoor-escalation-matrix.pdf");
  expect(errors).toEqual([]);
});

test("work persists in the browser across reloads of the file", async ({ page }) => {
  await open(page);
  await page.locator("nav button", { hasText: "Damage Assessment" }).click();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.locator("main label", { hasText: "Functional status" }).locator("input").fill("Offline edit");
  await page.getByRole("button", { name: "Save record" }).click();
  await page.reload();
  await page.locator("nav button", { hasText: "Damage Assessment" }).click();
  await expect(page.locator("main")).toContainText("Offline edit");
});

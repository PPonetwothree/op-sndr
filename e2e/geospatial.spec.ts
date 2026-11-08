import { test, expect, selectEvent, clock, infoTitle } from "./fixtures";

test.describe("Geospatial operations", () => {
  test("renders basemap, boundaries, contested areas, relief and symbols", async ({ page }) => {
    await expect(page.locator(".leaflet-base-fills-pane path").first()).toBeAttached();
    await expect(page.locator(".leaflet-india-boundary-pane path")).toHaveCount(2);
    await expect(page.locator(".leaflet-defacto-lines-pane path")).toHaveCount(4);
    await expect(page.locator(".contested-label")).toHaveText(["Aksai Chin", "Shaksgam Valley", "Gilgit-Baltistan", "Siachen", "PoJK", "Sir Creek"]);
    const relief = page.locator(".leaflet-relief-pane img");
    await expect(relief).toBeAttached();
    expect(await relief.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBe(1680);
    expect(await page.locator(".leaflet-marker-icon svg").count()).toBeGreaterThan(40);
  });

  test("playback advances the clock and pause stops it", async ({ page }) => {
    await page.getByRole("button", { name: "10×" }).click();
    const before = await clock(page).textContent();
    await page.getByTitle("Play / resume (Space)").click();
    await expect(clock(page)).not.toHaveText(before!);
    await page.getByTitle("Pause (Space)").click();
    const paused = await clock(page).textContent();
    await page.waitForTimeout(800);
    await expect(clock(page)).toHaveText(paused!);
  });

  test("step forward and backward walk the event sequence", async ({ page }) => {
    await page.getByTitle("Step forward (→)").click();
    await expect(infoTitle(page)).toHaveText("Pahalgam terrorist attack");
    await page.getByTitle("Step forward (→)").click();
    await expect(infoTitle(page)).toHaveText("CCS non-military measures against Pakistan");
    await page.getByTitle("Step backward (←)").click();
    await expect(infoTitle(page)).toHaveText("Pahalgam terrorist attack");
  });

  test("selecting an event animates its vector, shows formation and sources", async ({ page }) => {
    await selectEvent(page, "EVT-012");
    await expect(infoTitle(page)).toHaveText("Strike: Markaz Subhan Allah, Bahawalpur");
    await expect(page.locator("path.vec-draw")).toHaveCount(1);
    await expect(page.locator(".leaflet-marker-icon", { hasText: "FORMATION UNKNOWN" })).toHaveCount(1);
    await expect(page.locator("aside").last()).toContainText("Transcript of Special Briefing on OPERATION SINDOOR (May 07, 2025)");
    await expect(page.locator(".measure-label")).toContainText("Stated ~100 km from IB");
  });

  test("stated-distance checks show no mismatches for the 7 May camps", async ({ page }) => {
    for (const id of ["EVT-004", "EVT-006", "EVT-007", "EVT-008", "EVT-009", "EVT-010", "EVT-011", "EVT-012"]) {
      await selectEvent(page, id);
      await expect(page.locator(".measure-label")).toHaveCount(1);
      await expect(page.locator(".measure-label.mismatch")).toHaveCount(0);
    }
  });

  test("actor filter narrows the list and clears", async ({ page }) => {
    await expect(page.locator("[data-evt]")).toHaveCount(55);
    await page.getByRole("button", { name: "Pakistan", exact: true }).click();
    const n = await page.locator("[data-evt]").count();
    expect(n).toBeGreaterThan(5);
    expect(n).toBeLessThan(55);
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.locator("[data-evt]")).toHaveCount(55);
  });

  test("layer toggles remove vectors and markers", async ({ page }) => {
    await page.getByLabel("Show all events (ignore clock)").click();
    await expect.poll(() => page.locator(".leaflet-vectors-pane path").count()).toBeGreaterThan(20);
    await page.getByRole("button", { name: "Layers" }).click();
    await page.getByLabel("Illustrative vectors").click();
    await expect(page.locator(".leaflet-vectors-pane path")).toHaveCount(0);
    const before = await page.locator(".leaflet-marker-pane .leaflet-marker-icon").count();
    await page.getByLabel("Target markers (terrorist infrastructure)").click();
    await expect(page.locator(".leaflet-marker-pane .leaflet-marker-icon")).toHaveCount(before - 9);
  });

  test("compare mode shows two synced maps", async ({ page }) => {
    await page.getByRole("button", { name: "Compare days" }).click();
    await expect(page.locator(".leaflet-container")).toHaveCount(2);
    await expect(page.getByText("7 MAY 2025 · 16 events")).toBeVisible();
    await expect(page.getByText("10 MAY 2025 · 24 events")).toBeVisible();
  });

  test("exports events CSV, targets CSV and map PNG", async ({ page }) => {
    const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Events CSV" }).click()]);
    expect(csv.suggestedFilename()).toBe("sindoor-event-timeline.csv");
    const text = await (await csv.createReadStream()).toArray().then((c) => Buffer.concat(c).toString("utf8"));
    expect(text.split("\r\n")).toHaveLength(56);
    const [tg] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Targets CSV" }).click()]);
    expect(tg.suggestedFilename()).toBe("sindoor-target-database.csv");
    const [png] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Map PNG" }).click()]);
    expect(png.suggestedFilename()).toBe("sindoor-map-view.png");
  });
});

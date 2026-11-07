import { test, expect, selectEvent } from "./fixtures";

test.describe("Map quality (phase 3)", () => {
  test("state boundaries, labels, scale, north arrow, inset and night shading render", async ({ page }) => {
    await expect.poll(() => page.locator(".leaflet-admin1-pane path").count()).toBeGreaterThan(0);
    await expect(page.locator(".region-label", { hasText: "RAJASTHAN" })).toHaveCount(1);
    await expect(page.locator(".leaflet-control-scale-line")).toHaveCount(1);
    await expect(page.getByLabel("North arrow – north is up")).toBeVisible();
    await expect(page.getByRole("region", { name: "Overview map – click to pan" })).toBeVisible();
    await selectEvent(page, "EVT-004"); // 7 May ~01:06 IST – night
    await expect(page.locator(".leaflet-night-pane path")).toHaveCount(1);
  });

  test("coordinate readout shows MGRS under the cursor", async ({ page }) => {
    const map = page.locator(".leaflet-container").first();
    const box = (await map.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await expect(page.getByText(/^MGRS \d{2}[A-Z] [A-Z]{2} \d{2} \d{2}$/)).toBeVisible();
  });

  test("map PNG export includes title block and legend, then removes them", async ({ page }) => {
    await selectEvent(page, "EVT-012");
    const [png] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Map PNG" }).click()]);
    expect(png.suggestedFilename()).toBe("sindoor-map-view.png");
    await expect(page.getByText("OPERATION SINDOOR · MAP VIEW")).toHaveCount(0);
  });

  test("layer toggles for state boundaries and day/night work", async ({ page }) => {
    await page.getByRole("button", { name: "Layers" }).click();
    await page.getByLabel("State / province boundaries").click();
    await expect(page.locator(".leaflet-admin1-pane path")).toHaveCount(0);
    await page.getByLabel("Day / night at simulation clock").click();
    await expect(page.locator(".leaflet-night-pane path")).toHaveCount(0);
  });
});

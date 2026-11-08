import AxeBuilder from "@axe-core/playwright";
import { test, expect, openModule } from "./fixtures";

const MODULES = [
  "Geospatial",
  "Campaign Overview",
  "Force & Weapons",
  "Damage Assessment",
  "Escalation Matrix",
  "After-Action",
  "Source Management",
  "Methods & Data",
];

test.describe("Accessibility (axe-core, WCAG 2.1 A/AA)", () => {
  for (const m of MODULES) {
    test(`${m}: no serious or critical violations`, async ({ page }) => {
      await openModule(page, m);
      await page.waitForTimeout(800);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        // Leaflet's own panes/tiles are decorative canvas-like SVG; the app's controls are still audited.
        .exclude(".leaflet-map-pane")
        .analyze();
      const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      const summary = bad.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) – ${v.nodes[0]?.target.join(" ")}`).join("\n");
      expect(bad, summary).toEqual([]);
    });
  }
});

test.describe("Help panel", () => {
  test("opens with ?, traps the arrow keys, passes axe and closes with Esc", async ({ page }) => {
    await page.keyboard.press("?");
    const dialog = page.getByRole("dialog", { name: "Using the simulator" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close help" })).toBeFocused();
    const clock = await page.locator("header .mono").first().textContent();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("header .mono").first()).toHaveText(clock!);
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: "Help" }).click();
    await page.getByRole("button", { name: "Methods, rules and limitations" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("heading", { name: "Evidence classification" })).toBeVisible();
  });
});

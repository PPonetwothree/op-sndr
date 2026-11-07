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

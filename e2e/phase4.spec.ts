import { test, expect } from "./fixtures";

test.describe("Briefing, shareable links and tabletop turns", () => {
  test("guided briefing steps with buttons and keys, frames the map, exits with Esc", async ({ page }) => {
    await page.getByRole("button", { name: "Guided briefing" }).click();
    const panel = page.getByRole("region", { name: "Guided briefing" });
    await expect(panel.locator("h2")).toHaveText("The trigger: Pahalgam");
    await expect(panel).toContainText("1 / 16");
    await panel.getByRole("button", { name: "Next step (→)" }).click();
    await expect(panel.locator("h2")).toHaveText("Non-military measures");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(panel.locator("h2")).toHaveText("Camps across the Line of Control");
    await expect(page.locator("aside").last().locator("h3")).toHaveText("Strike: Sawai Nala camp, Muzaffarabad");
    await panel.getByLabel("Jump to chapter").selectOption("10 May · Cessation");
    await expect(panel.locator("h2")).toHaveText("The DGMO call: 15:35 → 17:00 IST");
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
  });

  test("a shared link restores briefing step and layers; another restores module and filters", async ({ page }) => {
    await page.goto("/#b=5&l=-relief");
    await expect(page.getByRole("region", { name: "Guided briefing" }).locator("h2")).toHaveText("Deep targets: Muridke and Bahawalpur");
    await expect(page.locator(".leaflet-relief-pane img")).toHaveCount(0);
    await page.goto("about:blank");
    await page.goto("/#m=overview&d=2025-05-09&e=EVT-020");
    await expect(page.locator("main .label-caps").first()).toHaveText("A · Campaign Overview");
    await expect(page.getByText(/Filters active/)).toContainText("9 MAY 2025");
  });

  test("the URL follows the view and Copy link produces it", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator('[data-evt="EVT-012"]').click();
    await expect.poll(() => page.evaluate(() => location.hash)).toContain("e=EVT-012");
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByRole("button", { name: "Link copied" })).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("#");
    expect(copied).toContain("e=EVT-012");
  });

  test("tabletop: moves need rulings before the turn can end; log and trace update", async ({ page }) => {
    await page.locator("nav button", { hasText: "Escalation Matrix" }).click();
    await page.getByRole("button", { name: "Hypothetical tabletop" }).click();
    await page.getByLabel("Blue move", { exact: true }).fill("Blue issues a demarche");
    await page.getByRole("button", { name: "Submit Blue move" }).click();
    await page.getByLabel("Red move", { exact: true }).fill("Red probes with drones");
    await page.getByLabel("Red intended rung").selectOption("5");
    await page.getByRole("button", { name: "Submit Red move" }).click();
    const end = page.getByRole("button", { name: /End turn 1/ });
    await expect(end).toBeDisabled();
    await page.getByRole("button", { name: "Rule", exact: true }).first().click();
    await page.getByLabel("Ruling", { exact: true }).selectOption("rejected");
    await page.getByLabel("Umpire note").fill("Not credible this turn");
    await page.getByRole("button", { name: "Rule", exact: true }).click();
    await expect(end).toBeEnabled();
    await end.click();
    await expect(page.getByText(/Turn 2 · current rung L1/)).toBeVisible();
    await expect(page.getByTestId("umpire-log-row")).toHaveCount(2);
    await expect(page.getByTestId("umpire-log-row").nth(1)).toContainText("rejected");
    const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "CSV" }).click()]);
    expect(csv.suggestedFilename()).toMatch(/^tabletop-.*-log\.csv$/);
  });
});

test("editing the hash in an open tab applies it", async ({ page }) => {
  await page.evaluate(() => (location.hash = "m=methods"));
  await expect(page.locator("main .label-caps").first()).toHaveText("M · Methods & Data Dictionary");
});

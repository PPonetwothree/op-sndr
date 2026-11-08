import { test, expect, openModule, clock } from "./fixtures";

test.describe("Modules", () => {
  test("overview: KPIs, charts, day drill-down and chart filter", async ({ page }) => {
    await openModule(page, "Campaign Overview");
    await expect(page.locator("main .mono.text-\\[22px\\]").first()).toHaveText("55");
    await expect.poll(() => page.locator(".recharts-bar-rectangle").count()).toBeGreaterThan(30);
    await page.getByRole("button", { name: /^8 MAY/ }).click();
    await expect(page.getByRole("button", { name: "Open on map" })).toBeVisible();
    await page.locator(".recharts-bar-rectangle").nth(2).click();
    await expect(page.getByText(/Filters active/)).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByText(/Filters active/)).toHaveCount(0);
  });

  test("forces: system card lists linked events; hypothetical builder", async ({ page }) => {
    await openModule(page, "Force & Weapons");
    await page.getByRole("button", { name: /Counter-UAS assets/ }).click();
    await page.getByRole("button", { name: /Integrated Counter-UAS Grid/ }).click();
    await expect(page.locator("main")).toContainText(/Associated events \(3\)/i);
    await page.getByRole("button", { name: "hypothetical" }).click();
    await page.getByRole("button", { name: "Add group" }).click();
    await expect(page.locator("main")).toContainText("Strike group ×2");
  });

  test("BDA: edit, persist, CSV and baseline reset; verified locked without GREEN source", async ({ page }) => {
    await openModule(page, "Damage Assessment");
    await expect(page.locator("main h2")).toHaveText("Sawai Nala camp");
    await page.getByRole("button", { name: "Edit" }).click();
    const claim = page.locator("main label", { hasText: "Claim status" }).locator("select");
    await expect(claim.locator('option[value="independently_verified"]')).toBeDisabled();
    await page.locator("main label", { hasText: "Functional status" }).locator("input").fill("E2E edit");
    await page.getByRole("button", { name: "Save record" }).click();
    await expect(page.locator("main")).toContainText("E2E edit");
    await page.reload();
    await page.locator("nav button", { hasText: "Damage Assessment" }).click();
    await expect(page.locator("main")).toContainText("E2E edit");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "BDA CSV" }).click()]);
    expect(dl.suggestedFilename()).toBe("sindoor-bda-records.csv");
    await page.getByRole("button", { name: "Baseline" }).click();
    const status = page.locator("main").getByText("Functional status", { exact: true }).locator("..");
    await expect(status).toContainText("UNKNOWN");
    // the revision history keeps the past change
    await expect(page.locator("main")).toContainText("Revision history (2)");
  });

  test("escalation: rung highlights map and timeline; matrix PDF; tabletop inject", async ({ page }) => {
    await openModule(page, "Escalation Matrix");
    await page.getByRole("button", { name: /Expanded UAV and counter-UAS confrontation/ }).click();
    const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Matrix PDF" }).click()]);
    expect(pdf.suggestedFilename()).toBe("sindoor-escalation-matrix.pdf");
    await page.getByRole("button", { name: /Show on map/ }).click();
    await expect(page.getByText(/Highlighting escalation level 5/)).toBeVisible();
    await expect.poll(() => page.locator("path.vec-flow").count()).toBeGreaterThan(5);
    await openModule(page, "Escalation Matrix");
    await page.getByRole("button", { name: "Hypothetical tabletop" }).click();
    await page.getByLabel("Red move", { exact: true }).fill("Red announces airspace closure");
    await page.getByRole("button", { name: "Submit Red move" }).click();
    await expect(page.getByTestId("tabletop-move")).toContainText("Red announces airspace closure");
  });

  test("after-action: scorecard assigns no scores; PDF and print report", async ({ page }) => {
    await openModule(page, "After-Action");
    const rows = page.locator("main table tbody tr");
    await expect(rows).toHaveCount(5);
    for (const r of await rows.all()) await expect(r).toContainText("Not assigned");
    const [pdf] = await Promise.all([page.waitForEvent("download", { timeout: 30_000 }), page.getByRole("button", { name: "Full campaign PDF" }).click()]);
    expect(pdf.suggestedFilename()).toBe("sindoor-campaign-assessment.pdf");
    await page.getByRole("button", { name: "Print-friendly report" }).click();
    await expect(page.locator(".print-report table")).toHaveCount(4);
    await page.locator(".print-report").getByRole("button", { name: "Close" }).click();
  });

  test("sources: add a GREEN source, link it, and it unlocks verification without upgrading the event", async ({ page }) => {
    await openModule(page, "Source Management");
    const field = (l: string) => page.locator("main label", { hasText: l }).locator("input, select").first();
    await field("Title").fill("E2E independent source");
    await field("Publisher").fill("Test");
    await field("Publication date").fill("2025-05-15");
    await field("URL").fill("https://example.org/e2e");
    await field("Source type").selectOption("independent");
    await field("Evidence class").selectOption("GREEN");
    await page.getByRole("button", { name: "Add source" }).click();
    await expect(page.getByText(/Added SRC-USER-001/)).toBeVisible();
    const link = page.locator("main select").filter({ has: page.locator("option", { hasText: "Link to event…" }) });
    await link.selectOption("EVT-012");
    await link.locator("xpath=..").getByRole("button").click();
    await openModule(page, "Geospatial");
    await page.locator('[data-evt="EVT-012"]').click();
    const info = page.locator("aside").last();
    await expect(info).toContainText("E2E independent source");
    await expect(info).toContainText("BLUE");
  });

  test("session: save, change clock, load restores it", async ({ page }) => {
    await page.getByTitle("Step forward (→)").click();
    await page.getByTitle("Step forward (→)").click();
    await page.getByTitle("Step forward (→)").click();
    const saved = await clock(page).textContent();
    await page.getByRole("button", { name: "Session" }).click();
    await page.getByPlaceholder("Session name").fill("e2e");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByTitle("Restart (Home)").click();
    await expect(clock(page)).not.toHaveText(saved!);
    await page.getByRole("button", { name: "Load" }).click();
    await expect(clock(page)).toHaveText(saved!);
  });
});

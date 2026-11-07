import { test, expect, openModule, selectEvent } from "./fixtures";

test.describe("Provenance, methods and audit", () => {
  test("event card shows field citations and the evidence trail", async ({ page }) => {
    await selectEvent(page, "EVT-047");
    const info = page.locator("aside").last();
    await info.getByRole("button", { name: /citation\(s\) for Time/ }).click();
    const trail = info.getByTestId("evidence-trail");
    await expect(trail).toContainText("called the Director General of Military Operations of India at 1535 hours IST");
    await expect(trail).toContainText("Statement by Foreign Secretary (May 10, 2025)");
    await expect(info.getByRole("link", { name: /Archived copy|No archive/ }).or(info.getByText("No archive capture found"))).toHaveCount(1);
  });

  test("Hindi excerpts carry an English gloss", async ({ page }) => {
    await selectEvent(page, "EVT-004");
    const info = page.locator("aside").last();
    await info.getByRole("button", { name: /citation\(s\) for Location/ }).click();
    await expect(info.getByTestId("evidence-trail")).toContainText("Gloss: Sawai Nala camp, Muzaffarabad, 30 km from the LoC.");
  });

  test("methods page renders sections and the full data dictionary", async ({ page }) => {
    await openModule(page, "Methods & Data");
    await expect(page.getByRole("heading", { name: "Evidence classification" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Deliberately excluded" })).toBeAttached();
    await expect(page.locator("article")).toContainText("126 citations");
    await expect(page.locator("article td.mono", { hasText: "provenance" })).toHaveCount(1);
    await expect(page.locator("article td.mono", { hasText: "archiveUrl" })).toHaveCount(1);
  });

  test("source register shows archive links", async ({ page }) => {
    await openModule(page, "Source Management");
    await expect.poll(() => page.getByRole("link", { name: /^Wayback \d{4}-\d{2}-\d{2}$/ }).count()).toBeGreaterThanOrEqual(20);
  });

  test("BDA edit is audited with field-level changes and shown in revision history", async ({ page }) => {
    await openModule(page, "Source Management");
    await page.getByRole("tab", { name: /Audit log/ }).click();
    await page.getByPlaceholder("e.g. A. Analyst").fill("E2E Analyst");
    await openModule(page, "Damage Assessment");
    await page.getByRole("button", { name: "Edit" }).click();
    await page.locator("main label", { hasText: "Functional status" }).locator("input").fill("Audited value");
    await page.getByRole("button", { name: "Save record" }).click();
    await expect(page.locator("main")).toContainText("Revision history (1)");
    await expect(page.locator("main [data-testid=audit-entry]")).toContainText("functionalStatus");
    await expect(page.locator("main [data-testid=audit-entry]")).toContainText("Audited value");
    await openModule(page, "Source Management");
    await page.getByRole("tab", { name: /Audit log \(1\)/ }).click();
    await expect(page.getByTestId("audit-entry").first()).toContainText("E2E Analyst");
    const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Audit CSV" }).click()]);
    expect(csv.suggestedFilename()).toBe("sindoor-audit-log.csv");
  });
});

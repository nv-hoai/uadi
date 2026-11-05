import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
test.beforeEach(async ({ page }) => {
 await page.route("**/*", async (route) => {
  const url = new URL(route.request().url());
  if (url.hostname === "127.0.0.1" && url.port === "4173") return route.continue();
  return route.abort("blockedbyclient");
 });
});
test("prototype renders, supports keyboard and field interaction", async ({ page }) => {
 await page.goto("/");
 await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
 const pageNavButton = page.getByRole("navigation", { name: "Prototype pages" }).getByRole("button", { name: "Home" });
 const contentNavButton = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Home" });
 const field = page.getByRole("textbox", { name: "Email address *" });
 await page.keyboard.press("Tab");
 await expect(pageNavButton).toBeFocused();
 await page.keyboard.press("Tab");
 await expect(contentNavButton).toBeFocused();
 await page.keyboard.press("Tab");
 await expect(field).toBeFocused();
 await field.fill("owner@example.com");
 await expect(field).toHaveValue("owner@example.com");
});
test("prototype has no serious or critical axe violations", async ({ page }) => {
 await page.goto("/");
 const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
 const blockers = results.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? ""));
 expect(blockers.map((item) => ({ id: item.id, help: item.help, nodes: item.nodes.length }))).toEqual([]);
});
test("responsive layout fits mobile, tablet and desktop viewports", async ({ page }) => {
 for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1280, height: 900 }]) {
  await page.setViewportSize(viewport);
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll, `horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(dimensions.client);
 }
});
test("capture deterministic desktop screenshot", async ({ page }, testInfo) => {
 await page.setViewportSize({ width: 1280, height: 900 });
 await page.goto("/");
 await page.evaluate(() => document.fonts.ready);
 const output = testInfo.outputPath("uadi-desktop.png");
 await page.screenshot({ path: output, fullPage: true, animations: "disabled" });
 expect((await fs.stat(output)).size).toBeGreaterThan(1000);
});
test("desktop rendering stays within the committed visual baseline", async ({ page }, testInfo) => {
 await page.setViewportSize({ width: 1280, height: 900 });
 await page.goto("/");
 await page.evaluate(() => document.fonts.ready);
 const actualBuffer = await page.screenshot({ fullPage: false, animations: "disabled" });
 const baselineSvg = await fs.readFile(new URL("./visual-baseline.svg", import.meta.url), "utf8");
 const referencePage = await page.context().newPage();
 await referencePage.setViewportSize({ width: 1280, height: 900 });
 await referencePage.setContent(baselineSvg);
 const expectedBuffer = await referencePage.screenshot({ fullPage: false });
 await referencePage.close();
 const actual = PNG.sync.read(actualBuffer);
 const expected = PNG.sync.read(expectedBuffer);
 expect(actual.width).toBe(expected.width);
 expect(actual.height).toBe(expected.height);
 const diff = new PNG({ width: actual.width, height: actual.height });
 const mismatched = pixelmatch(actual.data, expected.data, diff.data, actual.width, actual.height, { threshold: 0.18, includeAA: false });
 const ratio = mismatched / (actual.width * actual.height);
 await fs.writeFile(testInfo.outputPath("uadi-visual-diff.png"), PNG.sync.write(diff));
 expect(ratio, "visual difference ratio against tests/visual-baseline.svg").toBeLessThanOrEqual(0.38);
});

test("subscription settings exposes clear owner and member permissions", async ({ page }) => {
 await page.goto("/subscription-settings");
 await expect(page.getByRole("heading", { name: "Plan & billing" })).toBeVisible();
 await expect(page.getByRole("button", { name: "Cancel plan" })).toBeVisible();
 await page.getByRole("button", { name: "Member", exact: true }).click();
 await expect(page.getByText("Only workspace owners can cancel")).toBeVisible();
 await expect(page.getByText("Owner can change plan").first()).toBeVisible();
 await expect(page.getByRole("button", { name: "Cancel plan" })).toHaveCount(0);
 await expect(page.getByRole("button", { name: "Update" })).toHaveCount(0);
});

test("subscription settings updates billing period and labels sample pricing", async ({ page }) => {
 await page.goto("/subscription-settings");
 await expect(page.getByText("$490", { exact: true }).first()).toBeVisible();
 await page.getByRole("button", { name: "Monthly", exact: true }).click();
 await expect(page.getByText("$49", { exact: true }).first()).toBeVisible();
 await expect(page.getByText("Illustrative prices for this prototype only. Actual pricing and taxes depend on your agreement.")).toBeVisible();
});

test("cancellation requires deliberate confirmation and explains consequences", async ({ page }) => {
 await page.goto("/subscription-settings");
 await page.getByRole("button", { name: "Cancel plan" }).click();
 const dialog = page.getByRole("dialog", { name: "Cancel your Pro plan?" });
 await expect(dialog).toBeVisible();
 await expect(dialog.getByText(/more than 3 members/)).toBeVisible();
 await expect(dialog.getByText(/Demo interaction only/)).toBeVisible();
 await expect(dialog.getByRole("button", { name: "Close dialog" })).toBeFocused();
 await page.keyboard.press("Escape");
 await expect(dialog).toHaveCount(0);
 await expect(page.getByRole("button", { name: "Cancel plan" })).toBeFocused();
 await page.getByRole("button", { name: "Cancel plan" }).click();
 await page.getByRole("button", { name: "Confirm cancellation" }).click();
 await expect(page.getByRole("status").filter({ hasText: "Cancellation scheduled" })).toBeVisible();
 await expect(page.getByRole("button", { name: "Cancellation scheduled" })).toBeDisabled();
});

test("subscription settings passes serious and critical axe checks", async ({ page }) => {
 await page.goto("/subscription-settings");
 const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
 const blockers = results.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? ""));
 expect(blockers.map((item) => ({ id: item.id, help: item.help, nodes: item.nodes.length }))).toEqual([]);
});

test("subscription settings has no horizontal overflow on mobile or desktop", async ({ page }) => {
 for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1280, height: 900 }]) {
  await page.setViewportSize(viewport);
  await page.goto("/subscription-settings");
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll, "subscription settings horizontal overflow at " + viewport.width + "px").toBeLessThanOrEqual(dimensions.client);
 }
});

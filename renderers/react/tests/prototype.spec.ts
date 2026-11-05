import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
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
 const field = page.getByRole("textbox", { name: "Email address *" });
 await field.fill("owner@example.com");
 await expect(field).toHaveValue("owner@example.com");
 await field.press("Tab");
 await expect(page.locator(":focus")).toBeVisible();
});
test("prototype has no serious or critical axe violations", async ({ page }) => {
 await page.goto("/");
 const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
 const blockers = results.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? ""));
 expect(blockers.map((item) => ({ id: item.id, help: item.help, nodes: item.nodes.length }))).toEqual([]);
});
test("mobile layout fits viewport without horizontal overflow", async ({ page }) => {
 await page.setViewportSize({ width: 375, height: 812 });
 await page.goto("/");
 const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
 expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
});
test("capture deterministic desktop screenshot", async ({ page }, testInfo) => {
 await page.setViewportSize({ width: 1280, height: 900 });
 await page.goto("/");
 await page.evaluate(() => document.fonts.ready);
 const output = testInfo.outputPath("uadi-desktop.png");
 await page.screenshot({ path: output, fullPage: true, animations: "disabled" });
 expect((await fs.stat(output)).size).toBeGreaterThan(1000);
});

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { assertSupportedSection, unsupportedSpecFeatures } from "../src/validation";
import type { UdsSpecification } from "../src/types";

const minimalSpec = JSON.parse(readFileSync(new URL("../src/minimal-uds.json", import.meta.url), "utf8")) as UdsSpecification;
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
const VISUAL_OPTIONS = { fullPage: true, animations: "disabled" as const, maxDiffPixelRatio: 0.02 };

test("minimal UDS route matches the committed desktop baseline", async ({ page }) => {
 await page.setViewportSize({ width: 1280, height: 900 });
 await page.goto("/");
 await page.evaluate(() => document.fonts.ready);
 await expect(page).toHaveScreenshot("minimal-desktop.png", VISUAL_OPTIONS);
});

test("subscription settings matches desktop and mobile baselines", async ({ page }) => {
 await page.setViewportSize({ width: 1280, height: 900 });
 await page.goto("/subscription-settings");
 await page.evaluate(() => document.fonts.ready);
 await expect(page).toHaveScreenshot("subscription-desktop.png", VISUAL_OPTIONS);

 await page.setViewportSize({ width: 375, height: 812 });
 await page.goto("/subscription-settings");
 await page.evaluate(() => document.fonts.ready);
 await expect(page).toHaveScreenshot("subscription-mobile.png", VISUAL_OPTIONS);
});

test("cancellation dialog matches the committed baseline", async ({ page }) => {
 await page.setViewportSize({ width: 1280, height: 900 });
 await page.goto("/subscription-settings");
 await page.getByRole("button", { name: "Cancel plan" }).click();
 await expect(page.getByRole("dialog", { name: "Cancel your Pro plan?" })).toBeVisible();
 await expect(page).toHaveScreenshot("subscription-cancel-dialog.png", VISUAL_OPTIONS);
});

test("renderer accepts the supported layout fields in the minimal spec", () => {
 for (const section of (minimalSpec as UdsSpecification).pages[0].sections) {
  expect(() => assertSupportedSection(section)).not.toThrow();
 }
});

test("renderer rejects unsupported layout configuration", () => {
 expect(() => assertSupportedSection({
  section_id: "email",
  component_id: "uadi.form.field",
  layout: { type: "password" }
 })).toThrow(/Unsupported UADI uadi\.form\.field configuration: type/);
 expect(() => assertSupportedSection({
  section_id: "navigation",
  component_id: "uadi.navigation.primary",
  layout: { items: [{ label: "Home", icon: "house" }] }
 })).toThrow(/unknown property "icon"/);
});

test("renderer reports unsupported interaction semantics", () => {
 const spec = structuredClone(minimalSpec) as UdsSpecification;
 spec.pages[0].sections[0].interactions = [{ trigger: "click", result: "open panel" }];
 expect(unsupportedSpecFeatures(spec)).toEqual([expect.stringContaining("interaction definition")]);
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
 await expect(page.locator(".plan-price .amount")).toHaveText("$490");
 await page.getByRole("button", { name: "Monthly", exact: true }).click();
 await expect(page.locator(".plan-card").nth(1).locator(".amount")).toHaveText("$490");
 await expect(page.locator(".plan-card").nth(1).locator("small")).toContainText("/ year");
 await expect(page.locator(".plan-card").nth(2).locator(".amount")).toHaveText("$129");
 await expect(page.locator(".plan-card").nth(2).locator("small")).toContainText("/ month");
 await expect(page.locator(".plan-price .amount")).toHaveText("$490");
 await expect(page.getByText("Compare plan options. Your current Pro subscription is billed annually at $490 per year.")).toBeVisible();
});

test("cancellation requires deliberate confirmation and explains consequences", async ({ page }) => {
 await page.goto("/subscription-settings");
 await page.getByRole("button", { name: "Cancel plan" }).click();
 const dialog = page.getByRole("dialog", { name: "Cancel your Pro plan?" });
 await expect(dialog).toBeVisible();
 await expect(dialog.getByText(/more than 3 members/)).toBeVisible();
 await expect(dialog.getByText(/Demo interaction only/)).toBeVisible();
 await expect(dialog.getByRole("button", { name: "Close dialog" })).toBeFocused();
 await page.keyboard.press("Shift+Tab");
 await expect(dialog.getByRole("button", { name: "Confirm cancellation" })).toBeFocused();
 await page.keyboard.press("Tab");
 await expect(dialog.getByRole("button", { name: "Close dialog" })).toBeFocused();
 await page.keyboard.press("Escape");
 await expect(dialog).toHaveCount(0);
 await expect(page.getByRole("button", { name: "Cancel plan" })).toBeFocused();
 await page.getByRole("button", { name: "Cancel plan" }).click();
 await page.getByRole("button", { name: "Confirm cancellation" }).click();
 await expect(page.getByRole("status").filter({ hasText: "Cancellation scheduled" })).toBeVisible();
 await expect(page.getByRole("button", { name: "Cancellation scheduled" })).toBeDisabled();
 await page.getByRole("button", { name: "Undo cancellation" }).click();
 await expect(page.getByRole("button", { name: "Cancel plan" })).toBeEnabled();
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

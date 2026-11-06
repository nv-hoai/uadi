import type { UdsSection, UdsSpecification } from "./types.js";

const LAYOUT_KEYS: Record<string, readonly string[]> = {
  "uadi.layout.page-shell": [],
  "uadi.navigation.primary": ["items"],
  "uadi.feedback.alert": ["variant"],
  "uadi.form.field": ["label", "placeholder", "required", "type"],
  "uadi.data.empty-state": ["title"]
};

export const SUPPORTED_INPUT_TYPES = ["text", "email", "number", "search", "tel", "url"] as const;
export const ALERT_VARIANTS = ["info", "success", "warning", "error"] as const;

function fail(componentId: string, message: string): never {
  throw new Error(`Unsupported UADI ${componentId} configuration: ${message}`);
}

function assertString(value: unknown, componentId: string, property: string, { nonEmpty = false } = {}): void {
  if (typeof value !== "string" || (nonEmpty && value.trim() === "")) {
    fail(componentId, `${property} must be ${nonEmpty ? "a non-empty string" : "a string"}`);
  }
}

export function assertSupportedSection(section: UdsSection): void {
  const componentId = section.component_id;
  const allowedKeys = LAYOUT_KEYS[componentId];
  if (!allowedKeys) throw new Error(`Unsupported UADI component ID: ${componentId}`);

  const layout = section.layout ?? {};
  for (const key of Object.keys(layout)) {
    if (!allowedKeys.includes(key)) fail(componentId, `unknown layout property "${key}"`);
  }

  switch (componentId) {
    case "uadi.navigation.primary": {
      const items = layout.items;
      if (items !== undefined && !Array.isArray(items)) fail(componentId, "items must be an array");
      for (const [index, item] of ((items as unknown[]) ?? []).entries()) {
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
          fail(componentId, `items[${index}] must be an object`);
        }
        const entry = item as Record<string, unknown>;
        for (const key of Object.keys(entry)) {
          if (!["label", "href"].includes(key)) fail(componentId, `items[${index}] has unknown property "${key}"`);
        }
        assertString(entry.label, componentId, `items[${index}].label`, { nonEmpty: true });
        if (entry.href !== undefined) assertString(entry.href, componentId, `items[${index}].href`, { nonEmpty: true });
      }
      break;
    }
    case "uadi.feedback.alert": {
      const variant = layout.variant ?? "info";
      if (!(ALERT_VARIANTS as readonly unknown[]).includes(variant)) {
        fail(componentId, `variant must be one of: ${ALERT_VARIANTS.join(", ")}`);
      }
      break;
    }
    case "uadi.form.field": {
      if (layout.label !== undefined) assertString(layout.label, componentId, "label", { nonEmpty: true });
      if (layout.placeholder !== undefined) assertString(layout.placeholder, componentId, "placeholder");
      if (layout.required !== undefined && typeof layout.required !== "boolean") {
        fail(componentId, "required must be a boolean");
      }
      const type = layout.type ?? "text";
      if (!(SUPPORTED_INPUT_TYPES as readonly unknown[]).includes(type)) {
        fail(componentId, `type must be one of: ${SUPPORTED_INPUT_TYPES.join(", ")}`);
      }
      break;
    }
    case "uadi.data.empty-state": {
      if (layout.title !== undefined) assertString(layout.title, componentId, "title", { nonEmpty: true });
      break;
    }
  }
}

export function unsupportedSpecFeatures(spec: UdsSpecification): string[] {
  const interactions = spec.pages.reduce(
    (total, page) => total + page.sections.reduce(
      (count, section) => count + (section.interactions?.length ?? 0),
      0
    ),
    0
  );
  return interactions > 0
    ? [`${interactions} interaction definition(s) are documented but not implemented by this prototype renderer.`]
    : [];
}

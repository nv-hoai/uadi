import React from "react";
import type { ReactNode } from "react";
import type { SectionRenderer, UdsSection, UdsSpecification } from "./types.js";

function textValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function renderPageShell(section: UdsSection): ReactNode {
  return <main className="uadi-page-shell">{section.content_intent ?? "Page content"}</main>;
}

function renderPrimaryNavigation(section: UdsSection): ReactNode {
  const items = Array.isArray(section.layout?.items) ? section.layout.items : [];
  return (
    <nav aria-label="Primary navigation">
      <ul>{items.map((item, index) => <li key={index}>{String(item)}</li>)}</ul>
      {items.length === 0 ? <p>{section.content_intent ?? "Primary navigation placeholder"}</p> : null}
    </nav>
  );
}

function renderAlert(section: UdsSection): ReactNode {
  const variant = textValue(section.layout?.variant, "info");
  const role = variant === "error" ? "alert" : "status";
  return <div role={role} data-variant={variant}>{section.content_intent ?? "Status message placeholder"}</div>;
}

function renderFormField(section: UdsSection): ReactNode {
  const label = textValue(section.layout?.label, section.content_intent ?? "Field label");
  const placeholder = textValue(section.layout?.placeholder, "");
  return (
    <div className="uadi-form-field">
      <label>
        {label}
        <input placeholder={placeholder} />
      </label>
    </div>
  );
}

function renderEmptyState(section: UdsSection): ReactNode {
  return (
    <section className="uadi-empty-state">
      <h2>{textValue(section.layout?.title, "Nothing here yet")}</h2>
      <p>{section.content_intent ?? "Empty-state description"}</p>
    </section>
  );
}

const renderers: Record<string, SectionRenderer> = {
  "uadi.layout.page-shell": renderPageShell,
  "uadi.navigation.primary": renderPrimaryNavigation,
  "uadi.feedback.alert": renderAlert,
  "uadi.form.field": renderFormField,
  "uadi.data.empty-state": renderEmptyState,
};

export function renderSection(section: UdsSection): ReactNode {
  const renderer = renderers[section.component_id];
  if (!renderer) {
    throw new Error(`Unsupported UADI component ID: ${section.component_id}`);
  }
  return <div key={section.section_id} data-uadi-section={section.section_id}>{renderer(section)}</div>;
}

export function renderUds(spec: UdsSpecification): ReactNode {
  return (
    <div className="uadi-prototype" data-spec-id={spec.spec_id} data-spec-version={spec.version}>
      {spec.pages.map((page) => (
        <article key={page.page_id} aria-label={page.name}>
          <header><h1>{page.name}</h1>{page.purpose ? <p>{page.purpose}</p> : null}</header>
          {page.sections.map((section) => renderSection(section))}
        </article>
      ))}
    </div>
  );
}

export { renderers };
export type { UdsInteraction, UdsPage, UdsSection, UdsSpecification } from "./types.js";

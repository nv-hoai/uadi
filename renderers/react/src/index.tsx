import React, { useState } from "react";
import type { ReactNode } from "react";
import type { UdsSection, UdsSpecification, UadiRenderActions } from "./types.js";
function textValue(value: unknown, fallback: string): string { return typeof value === "string" && value.trim() ? value : fallback; }
function FormField({ section, actions }: { section: UdsSection; actions: UadiRenderActions }): ReactNode {
 const label = textValue(section.layout?.label, section.content_intent ?? "Field label");
 const placeholder = textValue(section.layout?.placeholder, "");
 const required = section.layout?.required === true;
 const type = textValue(section.layout?.type, "text");
 const [value, setValue] = useState("");
 const id = `uadi-field-${section.section_id}`;
 return <div className="uadi-form-field"><label htmlFor={id}>{label}{required ? " *" : ""}</label><input id={id} name={section.section_id} type={type} placeholder={placeholder} required={required} value={value} onChange={(event) => { setValue(event.target.value); actions.onFieldChange?.(section.section_id, event.target.value); }} /></div>;
}
function Section({ section, actions }: { section: UdsSection; actions: UadiRenderActions }): ReactNode {
 switch (section.component_id) {
  case "uadi.layout.page-shell": return <div className="uadi-page-shell">{section.content_intent ?? "Page content"}</div>;
  case "uadi.navigation.primary": {
   const items = Array.isArray(section.layout?.items) ? section.layout.items : [];
   return <nav aria-label="Primary navigation"><ul>{items.map((item, index) => {
    const entry = typeof item === "object" && item !== null ? item as Record<string, unknown> : { label: String(item), href: String(item) };
    const label = textValue(entry.label, `Navigation ${index + 1}`);
    const destination = textValue(entry.href, label);
    return <li key={index}><button type="button" onClick={() => actions.onNavigate?.(destination)}>{label}</button></li>;
   })}</ul>{items.length === 0 ? <p>{section.content_intent ?? "Primary navigation placeholder"}</p> : null}</nav>;
  }
  case "uadi.feedback.alert": { const variant = textValue(section.layout?.variant, "info"); return <div role={variant === "error" ? "alert" : "status"} data-variant={variant}>{section.content_intent ?? "Status message placeholder"}</div>; }
  case "uadi.form.field": return <FormField section={section} actions={actions} />;
  case "uadi.data.empty-state": return <section className="uadi-empty-state"><h2>{textValue(section.layout?.title, "Nothing here yet")}</h2><p>{section.content_intent ?? "Empty-state description"}</p></section>;
  default: throw new Error(`Unsupported UADI component ID: ${section.component_id}`);
 }
}
export function renderSection(section: UdsSection, actions: UadiRenderActions = {}): ReactNode {
 return <div key={section.section_id} data-uadi-section={section.section_id}><Section section={section} actions={actions} /></div>;
}
export function UadiPrototype({ spec, actions = {} }: { spec: UdsSpecification; actions?: UadiRenderActions }): ReactNode {
 const [activePage, setActivePage] = useState(spec.pages[0]?.page_id ?? "");
 const page = spec.pages.find((item) => item.page_id === activePage) ?? spec.pages[0];
 if (!page) return <div role="status">This specification has no pages.</div>;
 const wiredActions: UadiRenderActions = { ...actions, onNavigate: (destination) => { setActivePage(destination); actions.onNavigate?.(destination); } };
 return <div className="uadi-prototype" data-spec-id={spec.spec_id} data-spec-version={spec.version}>
  <nav aria-label="Prototype pages"><ul>{spec.pages.map((item) => <li key={item.page_id}><button type="button" aria-current={item.page_id === page.page_id ? "page" : undefined} onClick={() => setActivePage(item.page_id)}>{item.name}</button></li>)}</ul></nav>
  <main aria-label={page.name}><header><h1>{page.name}</h1>{page.purpose ? <p>{page.purpose}</p> : null}</header>{page.sections.map((section) => renderSection(section, wiredActions))}</main>
 </div>;
}
export function renderUds(spec: UdsSpecification): ReactNode { return <UadiPrototype spec={spec} />; }
export type { UdsInteraction, UdsPage, UdsSection, UdsSpecification, UadiRenderActions } from "./types.js";

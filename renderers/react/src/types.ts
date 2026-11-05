import type { ReactNode } from "react";
export interface UdsInteraction { trigger: string; result: string; state_change?: string; keyboard_behavior?: string; }
export interface UdsSection { section_id: string; component_id: string; content_intent?: string; layout?: Record<string, unknown>; interactions?: UdsInteraction[]; }
export interface UdsPage { page_id: string; name: string; purpose?: string; sections: UdsSection[]; }
export interface UdsSpecification { schema_version: "1.0.0"; spec_id: string; proposal_id: string; version: number; target: { platform: string; viewports: string[] }; tokens: Record<string, Record<string, string | number>>; pages: UdsPage[]; responsive: Array<{ breakpoint: string; behavior: string }>; accessibility: Array<{ requirement: string; level: "MUST" | "SHOULD" }>; notes?: string[]; }
export type SectionRenderer = (section: UdsSection, actions: UadiRenderActions) => ReactNode;
export interface UadiRenderActions { onNavigate?: (destination: string) => void; onFieldChange?: (sectionId: string, value: string) => void; }

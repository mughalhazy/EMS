// ============================================================
// Renderer Output Types — ui-renderer-spec/v1
// ============================================================

import type { RegionName, Breakpoint } from './wireframe'
import type { CanonicalComponent } from './component'

// ── Rendered node — output tree unit ────────────────────────
export interface RenderedNode {
  component: CanonicalComponent
  props: Record<string, unknown>
  layout: {
    region: RegionName
    span: number           // 1–12 desktop; 1–4 mobile
    order: number
    gap?: string
    responsive: Partial<Record<Breakpoint, { span?: number; hidden?: boolean }>>
  }
  styleTokens: string[]   // token references only — no literals
  state: 'default' | 'loading' | 'empty' | 'error'
  a11y: {
    role?: string
    'aria-label'?: string
    'aria-describedby'?: string
    'aria-live'?: 'polite' | 'assertive'
    focusOrder?: number
  }
  children: RenderedNode[]
  _blockId: string        // source block id for tracing
}

// ── Validation error ─────────────────────────────────────────
export interface ValidationError {
  code: string
  message: string
  blockId?: string
  category: ValidationCategory
  severity: 'error' | 'warning'
}

// ── 8 Validation categories (spec Section 8) ─────────────────
export type ValidationCategory =
  | 'accessibility'
  | 'contrast'
  | 'state_completeness'
  | 'wireframe_completeness'
  | 'component_reuse'
  | 'no_arbitrary_styling'
  | 'deterministic_failure'
  | 'constraint_enforcement'

// ── Resolution log entry ─────────────────────────────────────
export interface ResolutionEntry {
  blockId: string
  conflict: string
  resolution: string
  tier: 1 | 2 | 3 | 4 | 5   // conflict resolution tiers
}

// ── Render warning ───────────────────────────────────────────
export interface RenderWarning {
  blockId: string
  message: string
}

// ── Render result ────────────────────────────────────────────
export interface RenderResult {
  status: 'success' | 'failed'
  version: string
  documentId: string
  tree: RenderedNode[]            // empty on failure
  errors: ValidationError[]       // ordered; populated on failure
  warnings: RenderWarning[]       // non-blocking issues
  resolutionLog: ResolutionEntry[] // all resolved conflicts, ordered
}

// ── Pipeline context (internal) ──────────────────────────────
export interface PipelineContext {
  document: import('./wireframe').WireframeDocument
  version: string
  blocks: import('./wireframe').WireframeBlock[]  // flattened, ordered
  nodes: RenderedNode[]
  errors: ValidationError[]
  warnings: RenderWarning[]
  resolutionLog: ResolutionEntry[]
}

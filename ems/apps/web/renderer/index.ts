// ============================================================
// UI Renderer — Public API
// ui-renderer-spec/v1
// ============================================================

// ── Core engine ───────────────────────────────────────────────
export { render, validateOnly } from './core/RendererEngine'

// ── React components ──────────────────────────────────────────
export { RenderedPage }   from './components/RenderedPage'
export { RenderedRegion } from './components/RenderedRegion'
export { RenderedBlock }  from './components/RenderedBlock'

// ── Catalog utilities ─────────────────────────────────────────
export { getCatalogEntry }    from './catalog/ComponentCatalog'
export { COMPONENT_CATALOG }  from './catalog/ComponentCatalog'

// ── Types — wireframe ─────────────────────────────────────────
export type {
  WireframeDocument,
  WireframeBlock,
  WireframeRegion,
  BlockType,
  SurfaceType,
  RegionName,
  Breakpoint,
} from './types/wireframe'
export { RENDERER_VERSION, REGION_ORDER, BREAKPOINTS } from './types/wireframe'

// ── Types — components ────────────────────────────────────────
export type { CanonicalComponent, CatalogEntry, ComponentCatalogMap } from './types/component'
export { DEFAULT_SPANS } from './types/component'

// ── Types — output ────────────────────────────────────────────
export type {
  RenderedNode,
  ValidationError,
  ValidationCategory,
  ResolutionEntry,
  RenderWarning,
  RenderResult,
  PipelineContext,
} from './types/output'

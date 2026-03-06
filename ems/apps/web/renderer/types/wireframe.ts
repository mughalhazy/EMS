// ============================================================
// Wireframe Document Types — ui-renderer-spec/v1
// Source: ems/services/ui-renderer/spec.md
// ============================================================

export const RENDERER_VERSION = 'ui-renderer-spec/v1'

// ── Block Types (27 canonical + unknown fallback) ────────────
export type BlockType =
  | 'page_header'
  | 'primary_cta'
  | 'secondary_cta'
  | 'icon_action'
  | 'text_input'
  | 'long_text_input'
  | 'select_input'
  | 'toggle'
  | 'boolean_choice'
  | 'status_chip'
  | 'event_status'
  | 'metric_tile'
  | 'list_table'
  | 'audit_stream'
  | 'entity_card'
  | 'empty_placeholder'
  | 'loading_placeholder'
  | 'error_banner'
  | 'toast_feedback'
  | 'overlay_modal'
  | 'overlay_sidepanel'
  | 'context_menu'
  | 'quick_actions'
  | 'global_search'
  | 'top_navigation'
  | 'side_navigation'
  | 'breadcrumbs'
  | 'tabset'
  | 'tenant_selector'
  | 'venue_picker'
  | 'attendee_list'
  | 'unknown'

// ── Surface Types ────────────────────────────────────────────
export type SurfaceType = 'app' | 'portal' | 'auth'

// ── Region Names (ordered) ───────────────────────────────────
export type RegionName = 'top' | 'filters' | 'primary' | 'secondary' | 'footer'

export const REGION_ORDER: RegionName[] = ['top', 'filters', 'primary', 'secondary', 'footer']

// ── Responsive Breakpoints ───────────────────────────────────
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export const BREAKPOINTS: Record<Breakpoint, number> = {
  sm:   640,
  md:   768,   // mobile cutoff — 4-col grid, sidebar → drawer
  lg:  1024,   // tablet → desktop — 12-col, sidebar persistent
  xl:  1280,
  '2xl': 1536, // cap at 90rem max-width
}

// ── Wireframe Block ──────────────────────────────────────────
export interface WireframeBlock {
  id: string
  type: BlockType
  order?: number
  props?: Record<string, unknown>
  span?: number                         // 1–12 grid columns
  annotations?: Record<string, string>  // explicit overrides
  states?: {
    loading?: Partial<WireframeBlock>
    empty?:   Partial<WireframeBlock>
    error?:   Partial<WireframeBlock>
  }
  children?: WireframeBlock[]
  responsive?: Partial<Record<Breakpoint, Partial<WireframeBlock>>>
}

// ── Wireframe Region ─────────────────────────────────────────
export interface WireframeRegion {
  layout?: 'grid' | 'stack' | 'split'
  gap?: 'sm' | 'md' | 'lg'
  blocks: WireframeBlock[]
}

// ── Wireframe Document ───────────────────────────────────────
export interface WireframeDocument {
  id: string
  version: typeof RENDERER_VERSION
  surface: SurfaceType
  meta: {
    title: string
    route: string
    description?: string
    roles?: string[]
  }
  regions: Partial<Record<RegionName, WireframeRegion>> & {
    primary: WireframeRegion  // primary is required
  }
}

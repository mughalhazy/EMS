// ============================================================
// Component Catalog Types — ui-renderer-spec/v1
// ============================================================

import type { BlockType } from './wireframe'

// ── Canonical component names ────────────────────────────────
export type CanonicalComponent =
  | 'TopNav'
  | 'Sidebar'
  | 'Breadcrumb'
  | 'Button'
  | 'IconButton'
  | 'Input'
  | 'Textarea'
  | 'Select'
  | 'Switch'
  | 'Checkbox'
  | 'Radio'
  | 'EventStatusPill'
  | 'StatCard'
  | 'DataTable'
  | 'AuditLogTable'
  | 'Timeline'
  | 'EventCard'
  | 'Card'
  | 'EmptyState'
  | 'Skeleton'
  | 'Alert'
  | 'Toast'
  | 'Modal'
  | 'Drawer'
  | 'Popover'
  | 'CommandPalette'
  | 'Tabs'
  | 'TenantSwitcher'
  | 'VenueSelector'
  | 'AttendeeList'
  | 'AlertBanner'
  | 'ScheduleGrid'
  | 'PageHeader'
  | 'UnknownBlock'

// ── Default span heuristics ──────────────────────────────────
// Source: spec Section "Default Span Heuristics"
export const DEFAULT_SPANS: Partial<Record<BlockType, number>> = {
  page_header:        12,
  top_navigation:     12,
  error_banner:       12,
  list_table:         12,
  audit_stream:       12,
  attendee_list:      12,
  metric_tile:         4,
  entity_card:         4,
  text_input:          6,
  long_text_input:     6,
  select_input:        6,
  toggle:              6,
  boolean_choice:      6,
  primary_cta:         4,
  secondary_cta:       4,
  side_navigation:     3,
  breadcrumbs:        12,
  tabset:             12,
  global_search:       6,
  tenant_selector:     4,
  venue_picker:        6,
  status_chip:         2,
  event_status:        2,
  alert_banner:       12,
  schedule_grid:      12,
}

// ── Catalog entry ────────────────────────────────────────────
export interface CatalogEntry {
  component: CanonicalComponent
  defaultSpan: number
  defaultProps: Record<string, unknown>
  requiresA11yLabel: boolean
  supportsStates: boolean
  notes?: string
}

// ── Component mapping ────────────────────────────────────────
export type ComponentCatalogMap = Record<BlockType, CatalogEntry>

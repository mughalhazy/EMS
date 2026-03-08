// ============================================================
// Component Catalog — ui-renderer-spec/v1
// Maps every wireframe BlockType → CanonicalComponent
// Source: spec Component Mapping Table (27 block types)
// ============================================================

import type { BlockType, CatalogEntry, ComponentCatalogMap } from '../types/component'

export const COMPONENT_CATALOG: ComponentCatalogMap = {
  // ── Navigation ─────────────────────────────────────────────
  top_navigation: {
    component: 'TopNav',
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: false,
    notes: 'Global scope links/actions. Collapse secondary actions below md.',
  },
  side_navigation: {
    component: 'Sidebar',
    defaultSpan: 3,
    defaultProps: { collapsible: true },
    requiresA11yLabel: false,
    supportsStates: false,
    notes: 'Persistent above lg; collapses to Drawer below md.',
  },
  breadcrumbs: {
    component: 'Breadcrumb',
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: true,
    supportsStates: false,
    notes: 'Derived from hierarchy metadata.',
  },
  global_search: {
    component: 'CommandPalette',
    defaultSpan: 6,
    defaultProps: { trigger: 'ctrl+k' },
    requiresA11yLabel: true,
    supportsStates: false,
    notes: 'Keyboard-first (Ctrl/Cmd+K).',
  },
  tenant_selector: {
    component: 'TenantSwitcher',
    defaultSpan: 4,
    defaultProps: {},
    requiresA11yLabel: true,
    supportsStates: false,
    notes: 'Must include tenant context in output.',
  },

  // ── Content Headers ────────────────────────────────────────
  page_header: {
    component: 'PageHeader',
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: false,
    notes: 'Page title + subtitle strip. Actions slot via children.',
  },

  // ── Actions ───────────────────────────────────────────────
  primary_cta: {
    component: 'Button',
    defaultSpan: 4,
    defaultProps: { variant: 'primary' },
    requiresA11yLabel: true,
    supportsStates: true,
    notes: 'Variant inferred from priority.',
  },
  secondary_cta: {
    component: 'Button',
    defaultSpan: 4,
    defaultProps: { variant: 'ghost' },
    requiresA11yLabel: true,
    supportsStates: true,
  },
  icon_action: {
    component: 'IconButton',
    defaultSpan: 1,
    defaultProps: {},
    requiresA11yLabel: true,  // spec: requires accessible label
    supportsStates: true,
  },
  context_menu: {
    component: 'Popover',
    defaultSpan: 2,
    defaultProps: { trigger: 'click' },
    requiresA11yLabel: true,
    supportsStates: false,
    notes: 'Anchored to invoking element.',
  },
  quick_actions: {
    component: 'Popover',
    defaultSpan: 2,
    defaultProps: { trigger: 'click' },
    requiresA11yLabel: true,
    supportsStates: false,
  },

  // ── Form Inputs ────────────────────────────────────────────
  text_input: {
    component: 'Input',
    defaultSpan: 6,
    defaultProps: { type: 'text' },
    requiresA11yLabel: true,
    supportsStates: true,
    notes: 'Error annotation → invalid state.',
  },
  long_text_input: {
    component: 'Textarea',
    defaultSpan: 6,
    defaultProps: { rows: 3 },  // spec: minimum 3 rows
    requiresA11yLabel: true,
    supportsStates: true,
  },
  select_input: {
    component: 'Select',
    defaultSpan: 6,
    defaultProps: { placeholder: 'Select…' },  // spec: supports placeholder option
    requiresA11yLabel: true,
    supportsStates: true,
  },
  toggle: {
    component: 'Switch',
    defaultSpan: 6,
    defaultProps: { defaultChecked: false },
    requiresA11yLabel: true,
    supportsStates: true,
    notes: 'Boolean fields only.',
  },
  boolean_choice: {
    component: 'Checkbox',  // Radio if exclusive=true in annotations
    defaultSpan: 6,
    defaultProps: {},
    requiresA11yLabel: true,
    supportsStates: true,
    notes: 'Single = Checkbox; exclusive set = Radio.',
  },

  // ── Status / Display ───────────────────────────────────────
  status_chip: {
    component: 'EventStatusPill',
    defaultSpan: 2,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: false,
    notes: 'Semantic color by status value.',
  },
  event_status: {
    component: 'EventStatusPill',
    defaultSpan: 2,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: false,
  },

  // ── Data Display ───────────────────────────────────────────
  metric_tile: {
    component: 'StatCard',
    defaultSpan: 4,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: true,
    notes: 'Value + label + optional delta. 4-up desktop, 2-up tablet, 1-up mobile.',
  },
  list_table: {
    component: 'DataTable',
    defaultSpan: 12,
    defaultProps: { pageSize: 25 },
    requiresA11yLabel: false,
    supportsStates: true,
    notes: 'Paginate if rows exceed page size.',
  },
  audit_stream: {
    component: 'AuditLogTable',  // Timeline if no column annotations
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: true,
    notes: 'Table if columns annotated; else Timeline.',
  },
  entity_card: {
    component: 'EventCard',
    defaultSpan: 4,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: true,
    notes: 'Dashboard/event list cards.',
  },
  attendee_list: {
    component: 'AttendeeList',
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: true,
    notes: 'Includes search/filter controls.',
  },

  // ── State Placeholders ─────────────────────────────────────
  empty_placeholder: {
    component: 'EmptyState',
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: false,
    notes: 'Include recovery CTA when action exists.',
  },
  loading_placeholder: {
    component: 'Skeleton',
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: false,
    notes: 'Mirrors target block shape.',
  },
  error_banner: {
    component: 'Alert',
    defaultSpan: 12,
    defaultProps: { variant: 'brick', persistent: true },
    requiresA11yLabel: false,
    supportsStates: false,
    notes: 'Persistent at region top.',
  },

  // ── Overlays & Feedback ────────────────────────────────────
  toast_feedback: {
    component: 'Toast',
    defaultSpan: 4,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: false,
    notes: 'Non-blocking async feedback.',
  },
  overlay_modal: {
    component: 'Modal',
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: true,
    supportsStates: false,
    notes: 'Blocks underlying actions. sm width mobile, md/lg on desktop.',
  },
  overlay_sidepanel: {
    component: 'Drawer',
    defaultSpan: 4,
    defaultProps: { side: 'right' },
    requiresA11yLabel: true,
    supportsStates: false,
    notes: 'Contextual editing/navigation.',
  },

  // ── Navigation Patterns ────────────────────────────────────
  tabset: {
    component: 'Tabs',
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: true,
    supportsStates: false,
    notes: 'Requires explicit selectedTabId. Horizontal scroll below md.',
  },

  // ── Domain-Specific ────────────────────────────────────────
  venue_picker: {
    component: 'VenueSelector',
    defaultSpan: 6,
    defaultProps: {},
    requiresA11yLabel: true,
    supportsStates: true,
    notes: 'Venue + room selection flow.',
  },

  // ── Informational / Alert ──────────────────────────────────
  alert_banner: {
    component: 'AlertBanner',
    defaultSpan: 12,
    defaultProps: { variant: 'amber' },
    requiresA11yLabel: false,
    supportsStates: false,
    notes: 'Informational / warning banner. Variants: forest, amber, brick, indigo.',
  },

  // ── Schedule Grid ──────────────────────────────────────────
  schedule_grid: {
    component: 'ScheduleGrid',
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: true,
    notes: 'Time × room grid. Sessions colored by SessionType. Day tabs in toolbar.',
  },

  // ── Unknown Fallback ───────────────────────────────────────
  unknown: {
    component: 'UnknownBlock',
    defaultSpan: 12,
    defaultProps: {},
    requiresA11yLabel: false,
    supportsStates: false,
    notes: 'Card with title, description, optional placeholder. Issues renderWarnings entry.',
  },
}

export function getCatalogEntry(type: BlockType): CatalogEntry {
  return COMPONENT_CATALOG[type] ?? COMPONENT_CATALOG.unknown
}

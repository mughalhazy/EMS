// ============================================================
// LayoutEngine — Pipeline Step 3: 12-col grid + responsive rules
// Assigns span, order, region, gap, responsive overrides
// ============================================================

import { getCatalogEntry } from '../catalog/ComponentCatalog'
import { DEFAULT_SPANS } from '../types/component'
import type { WireframeBlock, RegionName, Breakpoint } from '../types/wireframe'
import type { RenderedNode } from '../types/output'

// ── Mobile grid is 4-col; spans are clamped per breakpoint ──
const MOBILE_MAX_SPAN  = 4
const DESKTOP_MAX_SPAN = 12

// ── Breakpoints where layout shifts occur ───────────────────
const MOBILE_BREAKPOINTS: Breakpoint[]  = ['sm']
const TABLET_BREAKPOINTS: Breakpoint[]  = ['md']
const DESKTOP_BREAKPOINTS: Breakpoint[] = ['lg', 'xl', '2xl']

// ── Components that span full-width on mobile regardless ─────
const FULL_WIDTH_MOBILE = new Set([
  'TopNav', 'Breadcrumb', 'Card', 'DataTable', 'AuditLogTable',
  'AttendeeList', 'Alert', 'EmptyState', 'Skeleton', 'Tabs',
])

export function applyLayout(
  block: WireframeBlock,
  region: RegionName,
  order: number,
  node: Partial<RenderedNode>,
  regionGap?: 'sm' | 'md' | 'lg',
): RenderedNode['layout'] {
  const entry = getCatalogEntry(block.type)

  // 1. Desktop span — priority: block.span > annotation > DEFAULT_SPANS > catalog default
  const annotationSpan = block.annotations?.span
    ? parseInt(block.annotations.span, 10)
    : undefined

  const desktopSpan = clamp(
    block.span ??
    annotationSpan ??
    DEFAULT_SPANS[block.type] ??
    entry.defaultSpan,
    1,
    DESKTOP_MAX_SPAN,
  )

  // 2. Build responsive map
  const responsive = buildResponsive(block, entry.component, desktopSpan)

  // 3. Map gap token
  const gapToken = regionGap ? `gap-${regionGap}` : undefined

  return {
    region,
    span: desktopSpan,
    order,
    gap: gapToken,
    responsive,
  }
}

// ── Responsive map builder ───────────────────────────────────
function buildResponsive(
  block: WireframeBlock,
  component: string,
  desktopSpan: number,
): RenderedNode['layout']['responsive'] {
  const responsive: RenderedNode['layout']['responsive'] = {}

  // Mobile (sm): most components go full-width unless they're inline
  const mobileSpan = FULL_WIDTH_MOBILE.has(component)
    ? MOBILE_MAX_SPAN
    : clamp(desktopSpan, 1, MOBILE_MAX_SPAN)

  for (const bp of MOBILE_BREAKPOINTS) {
    responsive[bp] = { span: mobileSpan }
  }

  // Tablet (md): half-width for narrow components, full for wide ones
  const tabletSpan = desktopSpan >= 8
    ? MOBILE_MAX_SPAN  // maps to full 4-col tablet
    : clamp(Math.ceil(desktopSpan * 0.75), 1, MOBILE_MAX_SPAN)

  for (const bp of TABLET_BREAKPOINTS) {
    responsive[bp] = { span: tabletSpan }
  }

  // Desktop (lg+): use declared span
  for (const bp of DESKTOP_BREAKPOINTS) {
    responsive[bp] = { span: desktopSpan }
  }

  // Apply explicit responsive overrides from the block
  if (block.responsive) {
    for (const [bp, override] of Object.entries(block.responsive) as [Breakpoint, Partial<WireframeBlock>][]) {
      if (override.span !== undefined) {
        responsive[bp] = {
          ...responsive[bp],
          span: clamp(override.span, 1, bp === 'sm' || bp === 'md' ? MOBILE_MAX_SPAN : DESKTOP_MAX_SPAN),
        }
      }
    }
  }

  // Sidebar: hidden on mobile (< md)
  if (component === 'Sidebar') {
    responsive.sm = { span: MOBILE_MAX_SPAN, hidden: true }
    responsive.md = { span: MOBILE_MAX_SPAN, hidden: true }
  }

  // Tabs: scroll on mobile (no span change, UX note only)
  // TopNav always full-width
  if (component === 'TopNav') {
    for (const bp of [...MOBILE_BREAKPOINTS, ...TABLET_BREAKPOINTS]) {
      responsive[bp] = { span: MOBILE_MAX_SPAN }
    }
  }

  return responsive
}

// ── Clamp utility ────────────────────────────────────────────
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

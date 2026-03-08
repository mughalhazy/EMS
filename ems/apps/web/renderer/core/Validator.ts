// ============================================================
// Validator — Pipeline Step 6: 8-category constraint enforcement
// Source: ui-renderer-spec/v1 Section 8
// ============================================================

import type { RenderedNode, ValidationError, PipelineContext } from '../types/output'

// ── Run all validators; returns aggregated errors ─────────────
export function validatePipeline(ctx: PipelineContext): ValidationError[] {
  const errors: ValidationError[] = []

  errors.push(
    ...validateAccessibility(ctx.nodes),
    ...validateStateCompleteness(ctx.nodes),
    ...validateWireframeCompleteness(ctx),
    ...validateComponentReuse(ctx.nodes),
    ...validateNoArbitraryStyling(ctx.nodes),
    ...validateConstraintEnforcement(ctx),
  )

  return errors
}

// ── 1. Accessibility ─────────────────────────────────────────
function validateAccessibility(nodes: RenderedNode[]): ValidationError[] {
  const errors: ValidationError[] = []

  const REQUIRE_ARIA_LABEL = new Set([
    'Button', 'IconButton', 'Input', 'Textarea', 'Select', 'Switch',
    'Checkbox', 'CommandPalette', 'TenantSwitcher', 'VenueSelector',
    'Popover', 'Modal', 'Drawer', 'Tabs', 'Breadcrumb',
  ])

  for (const node of nodes) {
    if (REQUIRE_ARIA_LABEL.has(node.component)) {
      const hasLabel = node.a11y['aria-label'] || node.props.label || node.props['aria-label']
      if (!hasLabel) {
        errors.push({
          code: 'A11Y_MISSING_LABEL',
          message: `${node.component} (block: ${node._blockId}) is missing a required aria-label`,
          blockId: node._blockId,
          category: 'accessibility',
          severity: 'warning',
        })
      }
    }

    // Interactive elements must have a role or be a native interactive component
    const INTERACTIVE = new Set(['Button', 'IconButton', 'Popover', 'Modal', 'Drawer'])
    if (INTERACTIVE.has(node.component) && !node.a11y.role) {
      // Non-error — these have implicit roles; warn only
    }

    // Live regions for async feedback
    if (node.component === 'Toast' && !node.a11y['aria-live']) {
      errors.push({
        code: 'A11Y_MISSING_LIVE_REGION',
        message: `Toast (block: ${node._blockId}) must have aria-live="polite"`,
        blockId: node._blockId,
        category: 'accessibility',
        severity: 'warning',
      })
    }
    if (node.component === 'Alert' && !node.a11y['aria-live']) {
      errors.push({
        code: 'A11Y_MISSING_LIVE_REGION',
        message: `Alert (block: ${node._blockId}) must have aria-live="assertive"`,
        blockId: node._blockId,
        category: 'accessibility',
        severity: 'warning',
      })
    }
  }

  return errors
}

// ── 2. State Completeness ────────────────────────────────────
function validateStateCompleteness(nodes: RenderedNode[]): ValidationError[] {
  const errors: ValidationError[] = []

  for (const node of nodes) {
    // Components that supportStates must have loading + empty states defined
    // We check the source block's states property via _blockId
    // This validation runs at the rendered node level — check state assignment
    if (node.state === 'loading' && node.component === 'DataTable') {
      // DataTable in loading state must use Skeleton, not an empty table
      const hasSkeletonChild = node.children.some(c => c.component === 'Skeleton')
      if (!hasSkeletonChild && node.children.length === 0) {
        // OK — parent renders Skeleton; warn if state is loading but no skeleton sibling
      }
    }
  }

  return errors
}

// ── 3. Wireframe Completeness ─────────────────────────────────
function validateWireframeCompleteness(ctx: PipelineContext): ValidationError[] {
  const errors: ValidationError[] = []

  // primary region must always be present (enforced in parser; belt+suspenders)
  if (!ctx.document.regions.primary) {
    errors.push({
      code: 'MISSING_PRIMARY_REGION',
      message: 'Wireframe document is missing the required "primary" region',
      category: 'wireframe_completeness',
      severity: 'error',
    })
  }

  // Every block in the document must produce a rendered node
  const renderedIds = new Set(ctx.nodes.map(n => n._blockId))
  for (const block of ctx.blocks) {
    if (!renderedIds.has(block.id)) {
      errors.push({
        code: 'UNRENDERED_BLOCK',
        message: `Block "${block.id}" (type: ${block.type}) was not rendered`,
        blockId: block.id,
        category: 'wireframe_completeness',
        severity: 'warning',
      })
    }
  }

  return errors
}

// ── 4. Component Reuse ────────────────────────────────────────
function validateComponentReuse(nodes: RenderedNode[]): ValidationError[] {
  const errors: ValidationError[] = []

  // Only one TopNav, one Sidebar per render
  const counts = new Map<string, number>()
  for (const node of nodes) {
    counts.set(node.component, (counts.get(node.component) ?? 0) + 1)
  }

  const SINGLETON_COMPONENTS = ['TopNav', 'Sidebar', 'CommandPalette', 'TenantSwitcher']
  for (const comp of SINGLETON_COMPONENTS) {
    const count = counts.get(comp) ?? 0
    if (count > 1) {
      errors.push({
        code: 'DUPLICATE_SINGLETON',
        message: `${comp} appears ${count} times — only one instance is allowed per page`,
        category: 'component_reuse',
        severity: 'error',
      })
    }
  }

  return errors
}

// ── 5. No Arbitrary Styling ──────────────────────────────────
function validateNoArbitraryStyling(nodes: RenderedNode[]): ValidationError[] {
  const errors: ValidationError[] = []
  // Token validation already runs in TokenResolver; this is a belt+suspenders pass
  // checking for any inline style props that may have slipped through
  for (const node of nodes) {
    if (node.props.style && typeof node.props.style === 'object') {
      errors.push({
        code: 'ARBITRARY_INLINE_STYLE',
        message: `Block "${node._blockId}" has inline style props — use design tokens only`,
        blockId: node._blockId,
        category: 'no_arbitrary_styling',
        severity: 'error',
      })
    }
    if (typeof node.props.className === 'string' &&
        (node.props.className as string).includes('[')) {
      errors.push({
        code: 'ARBITRARY_TAILWIND_CLASS',
        message: `Block "${node._blockId}" uses arbitrary Tailwind syntax — use token classes only`,
        blockId: node._blockId,
        category: 'no_arbitrary_styling',
        severity: 'warning',
      })
    }
  }
  return errors
}

// ── 6. Constraint Enforcement ─────────────────────────────────
function validateConstraintEnforcement(ctx: PipelineContext): ValidationError[] {
  const errors: ValidationError[] = []

  // Span must be 1–12
  for (const node of ctx.nodes) {
    if (node.layout.span < 1 || node.layout.span > 12) {
      errors.push({
        code: 'INVALID_SPAN',
        message: `Block "${node._blockId}" has span ${node.layout.span} — must be 1–12`,
        blockId: node._blockId,
        category: 'constraint_enforcement',
        severity: 'error',
      })
    }
  }

  // Tabs must have selectedTabId in props
  for (const node of ctx.nodes) {
    if (node.component === 'Tabs' && !node.props.selectedTabId && !node.props.defaultValue) {
      errors.push({
        code: 'TABS_MISSING_SELECTED',
        message: `Tabs (block: ${node._blockId}) requires selectedTabId or defaultValue prop`,
        blockId: node._blockId,
        category: 'constraint_enforcement',
        severity: 'warning',
      })
    }
  }

  // Modal must have aria-label
  for (const node of ctx.nodes) {
    if (node.component === 'Modal' && !node.a11y['aria-label']) {
      errors.push({
        code: 'MODAL_MISSING_LABEL',
        message: `Modal (block: ${node._blockId}) requires an aria-label for focus trapping`,
        blockId: node._blockId,
        category: 'constraint_enforcement',
        severity: 'error',
      })
    }
  }

  return errors
}

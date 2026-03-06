// ============================================================
// ComponentResolver — Pipeline Step 2: Map BlockType → Component
// Applies annotation overrides, emits warnings for unknowns
// ============================================================

import { getCatalogEntry } from '../catalog/ComponentCatalog'
import type { WireframeBlock } from '../types/wireframe'
import type { CatalogEntry } from '../types/component'
import type { RenderWarning, ResolutionEntry } from '../types/output'

export interface ResolvedComponent {
  entry: CatalogEntry
  resolvedProps: Record<string, unknown>
  warnings: RenderWarning[]
  resolutionLog: ResolutionEntry[]
}

// ── Annotation keys that map to component/prop overrides ─────
const ANNOTATION_COMPONENT_KEY = 'component'
const ANNOTATION_VARIANT_KEY   = 'variant'

// ── Main resolver ────────────────────────────────────────────
export function resolveComponent(block: WireframeBlock): ResolvedComponent {
  const warnings: RenderWarning[]       = []
  const resolutionLog: ResolutionEntry[] = []

  // Step 1: Catalog lookup
  let entry = getCatalogEntry(block.type)
  const wasUnknown = block.type === 'unknown' || !entry || entry.component === 'UnknownBlock'

  if (wasUnknown && block.type !== 'unknown') {
    warnings.push({
      blockId: block.id,
      message: `Unknown block type "${block.type}" — fell back to UnknownBlock`,
    })
  }

  // Step 2: Check for explicit component override in annotations
  const annotations = block.annotations ?? {}
  if (annotations[ANNOTATION_COMPONENT_KEY]) {
    resolutionLog.push({
      blockId: block.id,
      conflict: `Block type "${block.type}" annotation requests component override`,
      resolution: `Annotation component="${annotations[ANNOTATION_COMPONENT_KEY]}" applied (Tier 2)`,
      tier: 2,
    })
    // Override is noted in log; actual override handled by downstream block render
  }

  // Step 3: Merge props — precedence: block.props > annotation overrides > catalog defaults
  const resolvedProps = mergeProps(entry.defaultProps, annotations, block.props)

  // Step 4: Variant from annotations
  if (annotations[ANNOTATION_VARIANT_KEY]) {
    resolvedProps.variant = annotations[ANNOTATION_VARIANT_KEY]
    resolutionLog.push({
      blockId: block.id,
      conflict: `Variant specified via annotation`,
      resolution: `variant="${annotations[ANNOTATION_VARIANT_KEY]}" applied (Tier 2)`,
      tier: 2,
    })
  }

  // Step 5: Warn if requiresA11yLabel but no label provided
  if (entry.requiresA11yLabel) {
    const hasLabel =
      block.annotations?.['aria-label'] ||
      block.props?.['aria-label'] ||
      block.props?.label ||
      block.annotations?.label
    if (!hasLabel) {
      warnings.push({
        blockId: block.id,
        message: `Component "${entry.component}" requires an a11y label — add aria-label or label annotation`,
      })
    }
  }

  return { entry, resolvedProps, warnings, resolutionLog }
}

// ── Merge props with correct precedence ──────────────────────
function mergeProps(
  defaults: Record<string, unknown>,
  annotations: Record<string, string>,
  blockProps?: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...defaults }

  // Annotations that look like props (non-layout, non-component keys)
  const SKIP_KEYS = new Set([
    'component', 'variant', 'span', 'region', 'order',
    'aria-label', 'aria-describedby', 'aria-live', 'role', 'focusOrder',
  ])
  for (const [k, v] of Object.entries(annotations)) {
    if (!SKIP_KEYS.has(k)) result[k] = v
  }

  // Block-level props have highest priority
  if (blockProps) {
    Object.assign(result, blockProps)
  }

  return result
}

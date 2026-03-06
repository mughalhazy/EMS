// ============================================================
// Step 7: Produce Output — build final RenderResult
// Applies a11y, state, children; assembles deterministic tree
// ============================================================

import type { PipelineContext, RenderedNode, RenderResult } from '../../types/output'
import type { WireframeBlock } from '../../types/wireframe'

export function stepProduceOutput(ctx: PipelineContext): RenderResult {
  const hasErrors = ctx.errors.some(e => e.severity === 'error')

  if (hasErrors) {
    return {
      status: 'failed',
      version: ctx.version,
      documentId: ctx.document.id,
      tree: [],
      errors: ctx.errors,
      warnings: ctx.warnings,
      resolutionLog: ctx.resolutionLog,
    }
  }

  // Build block map
  const blockMap = new Map<string, WireframeBlock>()
  for (const block of ctx.blocks) {
    blockMap.set(block.id, block)
  }

  // Enrich nodes with a11y + state
  const enriched = ctx.nodes.map(node => enrichNode(node, blockMap))

  // Build tree — top-level nodes only; children are nested
  const childIds = new Set<string>()
  for (const node of enriched) {
    for (const child of node.children) {
      childIds.add(child._blockId)
    }
  }
  const tree = enriched.filter(n => !childIds.has(n._blockId))

  return {
    status: 'success',
    version: ctx.version,
    documentId: ctx.document.id,
    tree,
    errors: ctx.errors,       // may contain warnings promoted to errors
    warnings: ctx.warnings,
    resolutionLog: ctx.resolutionLog,
  }
}

// ── Enrich node with a11y attrs and state from block ─────────
function enrichNode(
  node: RenderedNode,
  blockMap: Map<string, WireframeBlock>,
): RenderedNode {
  const block = blockMap.get(node._blockId)
  if (!block) return node

  const annotations = block.annotations ?? {}

  // A11y from annotations
  const a11y: RenderedNode['a11y'] = {
    role:              annotations.role,
    'aria-label':      annotations['aria-label'] ?? (node.props['aria-label'] as string | undefined),
    'aria-describedby': annotations['aria-describedby'],
    'aria-live':       annotations['aria-live'] as RenderedNode['a11y']['aria-live'],
    focusOrder:        annotations.focusOrder ? parseInt(annotations.focusOrder, 10) : undefined,
  }

  // Auto-assign aria-live for feedback components
  if (node.component === 'Toast' && !a11y['aria-live']) {
    a11y['aria-live'] = 'polite'
  }
  if (node.component === 'Alert' && !a11y['aria-live']) {
    a11y['aria-live'] = 'assertive'
  }

  // Determine state from block.states keys present
  let state: RenderedNode['state'] = 'default'
  if (block.states?.loading) state = 'loading'
  if (block.states?.error)   state = 'error'
  if (block.states?.empty)   state = 'empty'
  // Explicit state prop overrides
  if (block.props?.state && typeof block.props.state === 'string') {
    state = block.props.state as RenderedNode['state']
  }

  // Build children from block.children (already in nodes)
  const children = (block.children ?? []).map(childBlock => {
    const childNode = blockMap.get(childBlock.id)
    if (!childNode) return null
    const matchingNode = { ...node, _blockId: childBlock.id }
    return enrichNode(matchingNode, blockMap)
  }).filter((n): n is RenderedNode => n !== null)

  return { ...node, a11y, state, children }
}

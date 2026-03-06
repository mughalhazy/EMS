// ============================================================
// Step 3: Apply Layout — assign spans, regions, responsive map
// ============================================================

import { applyLayout } from '../../core/LayoutEngine'
import type { PipelineContext, RenderedNode } from '../../types/output'
import type { WireframeBlock, RegionName } from '../../types/wireframe'
import { REGION_ORDER } from '../../types/wireframe'

export function stepApplyLayout(ctx: PipelineContext): PipelineContext {
  // Build a block-id → block map for fast lookup
  const blockMap = new Map<string, WireframeBlock>()
  for (const block of ctx.blocks) {
    blockMap.set(block.id, block)
  }

  // Build a block-id → region gap map
  const regionGapMap = new Map<string, 'sm' | 'md' | 'lg' | undefined>()
  for (const region of REGION_ORDER) {
    const r = ctx.document.regions[region as RegionName]
    if (!r) continue
    for (const block of r.blocks) {
      regionGapMap.set(block.id, r.gap)
    }
  }

  // Track per-region order counters
  const orderCounters = new Map<RegionName, number>()

  const nodes: RenderedNode[] = ctx.nodes.map(node => {
    const block = blockMap.get(node._blockId)
    if (!block) return node

    const region = node.layout.region as RegionName
    const counter = (orderCounters.get(region) ?? 0)
    orderCounters.set(region, counter + 1)

    const layout = applyLayout(
      block,
      region,
      block.order ?? counter,
      node,
      regionGapMap.get(block.id),
    )

    return { ...node, layout }
  })

  return { ...ctx, nodes }
}

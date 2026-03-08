// ============================================================
// Step 2: Resolve Components — map each block to canonical component
// ============================================================

import { resolveComponent } from '../../core/ComponentResolver'
import type { PipelineContext, RenderedNode } from '../../types/output'
import { getBlockRegion } from '../../core/WireframeParser'

export function stepResolveComponents(ctx: PipelineContext): PipelineContext {
  const nodes: RenderedNode[] = []

  for (const block of ctx.blocks) {
    const { entry, resolvedProps, warnings, resolutionLog } = resolveComponent(block)

    const region = getBlockRegion(ctx.document, block.id) ?? 'primary'

    // Data bridge: if block declares a dataKey, inject the matching slice from ctx.data
    const dataKey = block.props?.dataKey as string | undefined
    const injectedData = dataKey && ctx.data?.[dataKey] !== undefined
      ? { data: ctx.data[dataKey], dataKey }
      : {}

    const node: RenderedNode = {
      component: entry.component,
      props: { ...resolvedProps, ...injectedData },
      layout: {
        region,
        span: entry.defaultSpan,
        order: block.order ?? 0,
        responsive: {},
      },
      styleTokens: [],
      state: 'default',
      a11y: {},
      children: [],
      _blockId: block.id,
    }

    nodes.push(node)
    ctx.warnings.push(...warnings)
    ctx.resolutionLog.push(...resolutionLog)
  }

  return { ...ctx, nodes }
}

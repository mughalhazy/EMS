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

    // Data bridge: primary — resolve dataKey → data
    const dataKey = block.props?.dataKey as string | undefined
    const injectedData = dataKey && ctx.data?.[dataKey] !== undefined
      ? { data: ctx.data[dataKey], dataKey }
      : {}

    // Data bridge: secondary — resolve any *Key prop → its named value
    // e.g. activeDayKey:"activeDay" → activeDay: ctx.data["activeDay"]
    // e.g. optionsKey:"events"      → options:   ctx.data["events"]
    // e.g. tabsDataKey:"days"       → tabsData:  ctx.data["days"]
    const multiKeyInjected: Record<string, unknown> = {}
    for (const [propName, propVal] of Object.entries(block.props ?? {})) {
      if (
        propName !== 'dataKey' &&
        propName.endsWith('Key') &&
        typeof propVal === 'string' &&
        ctx.data?.[propVal] !== undefined
      ) {
        const resolvedName = propName.slice(0, -3) // strip "Key" suffix
        multiKeyInjected[resolvedName] = ctx.data[propVal]
      }
    }

    // Populate a11y from block.annotations (aria-label, aria-live, etc.)
    const ann = block.annotations ?? {}
    const a11y: RenderedNode['a11y'] = {}
    if (ann['aria-label'])       a11y['aria-label']       = ann['aria-label']
    if (ann['aria-describedby']) a11y['aria-describedby'] = ann['aria-describedby']
    if (ann['aria-live'])        a11y['aria-live']        = ann['aria-live']
    if (ann['role'])             a11y['role']             = ann['role']

    const node: RenderedNode = {
      component: entry.component,
      props: { ...resolvedProps, ...injectedData, ...multiKeyInjected },
      layout: {
        region,
        span: block.span ?? entry.defaultSpan,
        order: block.order ?? 0,
        responsive: {},
      },
      styleTokens: [],
      state: 'default',
      a11y,
      children: [],
      _blockId: block.id,
    }

    nodes.push(node)
    ctx.warnings.push(...warnings)
    ctx.resolutionLog.push(...resolutionLog)
  }

  return { ...ctx, nodes }
}

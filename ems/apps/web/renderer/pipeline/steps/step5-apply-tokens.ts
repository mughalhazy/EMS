// ============================================================
// Step 5: Apply Tokens — resolve and validate style tokens
// No arbitrary CSS literals; token references only
// ============================================================

import { deriveTokens, resolveTokens } from '../../core/TokenResolver'
import type { PipelineContext, RenderedNode } from '../../types/output'
import type { WireframeBlock } from '../../types/wireframe'

export function stepApplyTokens(ctx: PipelineContext): PipelineContext {
  const blockMap = new Map<string, WireframeBlock>()
  for (const block of ctx.blocks) {
    blockMap.set(block.id, block)
  }

  const errors = [...ctx.errors]
  const nodes: RenderedNode[] = ctx.nodes.map(node => {
    const block = blockMap.get(node._blockId)
    const variant = (node.props.variant ?? block?.annotations?.variant) as string | undefined

    // Derive semantic tokens from component + state context
    const derived = deriveTokens(node.component, node.state, variant)

    // If block has explicit styleTokens in props, validate them too
    const explicitTokens = Array.isArray(block?.props?.styleTokens)
      ? (block!.props!.styleTokens as string[])
      : []

    const allTokens = [...derived, ...explicitTokens]
    const { tokens, errors: tokenErrors } = resolveTokens(node, allTokens)

    errors.push(...tokenErrors)

    return { ...node, styleTokens: tokens }
  })

  return { ...ctx, nodes, errors }
}

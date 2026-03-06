// ============================================================
// Step 4: Responsive Transform — finalize breakpoint overrides
// Applies block.responsive overrides and surface-level rules
// ============================================================

import type { PipelineContext, RenderedNode } from '../../types/output'
import type { WireframeBlock } from '../../types/wireframe'

export function stepResponsiveTransform(ctx: PipelineContext): PipelineContext {
  const blockMap = new Map<string, WireframeBlock>()
  for (const block of ctx.blocks) {
    blockMap.set(block.id, block)
  }

  // Surface-level rules
  const isPortal = ctx.document.surface === 'portal'
  const isAuth   = ctx.document.surface === 'auth'

  const nodes: RenderedNode[] = ctx.nodes.map(node => {
    const block = blockMap.get(node._blockId)
    const layout = { ...node.layout, responsive: { ...node.layout.responsive } }

    // Portal surface: wider components center at max-width (handled in CSS)
    // Auth surface: everything stacks single column
    if (isAuth) {
      layout.responsive.sm = { span: 4 }
      layout.responsive.md = { span: 4 }
      layout.responsive.lg = { span: Math.min(layout.span, 6) }
    }

    // Block-level explicit responsive overrides (highest priority)
    if (block?.responsive) {
      for (const [bp, override] of Object.entries(block.responsive)) {
        if (override.span !== undefined || override.responsive !== undefined) {
          layout.responsive[bp as keyof typeof layout.responsive] = {
            ...layout.responsive[bp as keyof typeof layout.responsive],
            span: override.span,
          }
        }
      }
    }

    // Hide Sidebar on portal/auth surfaces entirely
    if (node.component === 'Sidebar' && (isPortal || isAuth)) {
      layout.responsive.sm = { span: 0, hidden: true }
      layout.responsive.md = { span: 0, hidden: true }
      layout.responsive.lg = { span: 0, hidden: true }
    }

    return { ...node, layout }
  })

  return { ...ctx, nodes }
}

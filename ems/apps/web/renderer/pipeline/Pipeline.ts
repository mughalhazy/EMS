// ============================================================
// Pipeline — 7-step deterministic render pipeline
// ui-renderer-spec/v1
// ============================================================

import { RENDERER_VERSION } from '../types/wireframe'
import type { RenderResult } from '../types/output'

import { stepNormalize }           from './steps/step1-normalize'
import { stepResolveComponents }   from './steps/step2-resolve-components'
import { stepApplyLayout }         from './steps/step3-apply-layout'
import { stepResponsiveTransform } from './steps/step4-responsive-transform'
import { stepApplyTokens }         from './steps/step5-apply-tokens'
import { stepValidate }            from './steps/step6-validate'
import { stepProduceOutput }       from './steps/step7-produce-output'

// ── Run the full 7-step pipeline ─────────────────────────────
export function runPipeline(doc: unknown, data?: Record<string, unknown>): RenderResult {
  // Step 1: Normalize & parse
  const normalized = stepNormalize(doc, RENDERER_VERSION, data)
  if (!normalized.ok) {
    return {
      status: 'failed',
      version: RENDERER_VERSION,
      documentId: (doc as Record<string, unknown>)?.id as string ?? 'unknown',
      tree: [],
      errors: [normalized.error],
      warnings: [],
      resolutionLog: [],
    }
  }

  let ctx = normalized.context

  // Step 2: Resolve components
  ctx = stepResolveComponents(ctx)

  // Step 3: Apply layout (spans, regions, order)
  ctx = stepApplyLayout(ctx)

  // Step 4: Responsive transform (breakpoint overrides)
  ctx = stepResponsiveTransform(ctx)

  // Step 5: Apply tokens (semantic + validated)
  ctx = stepApplyTokens(ctx)

  // Step 6: Validate (8 categories)
  ctx = stepValidate(ctx)

  // Step 7: Produce output (fail-fast on errors)
  return stepProduceOutput(ctx)
}

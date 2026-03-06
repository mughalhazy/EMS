// ============================================================
// Step 6: Validate — 8-category constraint enforcement
// Fails fast on errors; collects all warnings
// ============================================================

import { validatePipeline } from '../../core/Validator'
import type { PipelineContext } from '../../types/output'

export function stepValidate(ctx: PipelineContext): PipelineContext {
  const newErrors = validatePipeline(ctx)

  return {
    ...ctx,
    errors: [...ctx.errors, ...newErrors],
  }
}

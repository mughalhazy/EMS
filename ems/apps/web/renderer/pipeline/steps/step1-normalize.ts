// ============================================================
// Step 1: Normalize — parse + validate wireframe document
// ============================================================

import { parseWireframe } from '../../core/WireframeParser'
import type { PipelineContext, ValidationError } from '../../types/output'

export function stepNormalize(
  doc: unknown,
  version: string,
  data?: Record<string, unknown>,
): { ok: true; context: PipelineContext } | { ok: false; error: ValidationError } {
  const result = parseWireframe(doc, version, data)

  if (!result.ok || !result.context) {
    return {
      ok: false,
      error: {
        code: 'PARSE_FAILURE',
        message: result.error ?? 'Unknown parse error',
        category: 'deterministic_failure',
        severity: 'error',
      },
    }
  }

  return { ok: true, context: result.context }
}

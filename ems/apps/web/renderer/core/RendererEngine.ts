// ============================================================
// RendererEngine — Public API wrapper around Pipeline
// Provides error-safe entry point with result coercion
// ============================================================

import { runPipeline } from '../pipeline/Pipeline'
import { RENDERER_VERSION } from '../types/wireframe'
import type { RenderResult } from '../types/output'

// ── Main render function ──────────────────────────────────────
export function render(doc: unknown): RenderResult {
  try {
    return runPipeline(doc)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      status: 'failed',
      version: RENDERER_VERSION,
      documentId: 'unknown',
      tree: [],
      errors: [
        {
          code: 'RENDERER_EXCEPTION',
          message: `Unhandled renderer exception: ${message}`,
          category: 'deterministic_failure',
          severity: 'error',
        },
      ],
      warnings: [],
      resolutionLog: [],
    }
  }
}

// ── Validate only (no React output) ──────────────────────────
export function validateOnly(doc: unknown): Pick<RenderResult, 'errors' | 'warnings'> {
  const result = render(doc)
  return { errors: result.errors, warnings: result.warnings }
}

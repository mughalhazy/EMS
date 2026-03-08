// ============================================================
// WireframeParser — Pipeline Step 1: Normalize & Validate Input
// Flattens the document, orders blocks, enforces schema
// ============================================================

import { RENDERER_VERSION } from '../types/wireframe'
import type {
  WireframeDocument,
  WireframeBlock,
  RegionName,
} from '../types/wireframe'
import type { PipelineContext } from '../types/output'
import { REGION_ORDER } from '../types/wireframe'

const VALID_SURFACES = new Set(['app', 'portal', 'auth'])

export interface ParseResult {
  ok: boolean
  context?: PipelineContext
  error?: string
}

// ── Entry point ──────────────────────────────────────────────
export function parseWireframe(
  doc: unknown,
  version: string,
  data?: Record<string, unknown>,
): ParseResult {
  // 1. Type-guard: must be a plain object
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return { ok: false, error: 'INVALID_INPUT: wireframe document must be a plain object' }
  }

  const raw = doc as Record<string, unknown>

  // 2. Version check
  if (raw.version !== RENDERER_VERSION) {
    return {
      ok: false,
      error: `VERSION_MISMATCH: expected "${RENDERER_VERSION}", got "${raw.version}"`,
    }
  }

  // 3. Required fields
  if (typeof raw.id !== 'string' || !raw.id) {
    return { ok: false, error: 'MISSING_FIELD: document.id is required' }
  }
  if (!VALID_SURFACES.has(raw.surface as string)) {
    return { ok: false, error: `INVALID_SURFACE: "${raw.surface}" is not a valid surface type` }
  }
  if (!raw.meta || typeof raw.meta !== 'object') {
    return { ok: false, error: 'MISSING_FIELD: document.meta is required' }
  }
  if (!raw.regions || typeof raw.regions !== 'object') {
    return { ok: false, error: 'MISSING_FIELD: document.regions is required' }
  }

  const regions = raw.regions as Record<string, unknown>
  if (!regions.primary) {
    return { ok: false, error: 'MISSING_REGION: regions.primary is required' }
  }

  const wireframe = raw as WireframeDocument

  // 4. Flatten all blocks across regions in REGION_ORDER
  const blocks = flattenBlocks(wireframe)

  return {
    ok: true,
    context: {
      document: wireframe,
      version,
      blocks,
      nodes: [],
      errors: [],
      warnings: [],
      resolutionLog: [],
      data,
    },
  }
}

// ── Flatten blocks from all regions in canonical region order ─
function flattenBlocks(doc: WireframeDocument): WireframeBlock[] {
  const result: WireframeBlock[] = []

  for (const region of REGION_ORDER) {
    const r = doc.regions[region as RegionName]
    if (!r) continue

    const sorted = [...r.blocks].sort((a, b) => {
      const ao = a.order ?? 0
      const bo = b.order ?? 0
      return ao - bo
    })

    for (const block of sorted) {
      result.push(...flattenBlock(block))
    }
  }

  return result
}

// ── Recursively flatten children (depth-first, pre-order) ────
function flattenBlock(block: WireframeBlock): WireframeBlock[] {
  const result: WireframeBlock[] = [block]
  if (block.children && block.children.length > 0) {
    for (const child of block.children) {
      result.push(...flattenBlock(child))
    }
  }
  return result
}

// ── Utility: get region for a block id ───────────────────────
export function getBlockRegion(
  doc: WireframeDocument,
  blockId: string,
): RegionName | null {
  for (const region of REGION_ORDER) {
    const r = doc.regions[region as RegionName]
    if (!r) continue
    if (containsBlock(r.blocks, blockId)) return region as RegionName
  }
  return null
}

function containsBlock(blocks: WireframeBlock[], id: string): boolean {
  for (const b of blocks) {
    if (b.id === id) return true
    if (b.children && containsBlock(b.children, id)) return true
  }
  return false
}

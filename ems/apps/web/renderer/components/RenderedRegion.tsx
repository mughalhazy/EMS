'use client'

// ============================================================
// RenderedRegion — renders all nodes in a named region
// Uses 12-col CSS grid; stacks in region order
// ============================================================

import React from 'react'
import type { RenderedNode } from '../types/output'
import type { RegionName } from '../types/wireframe'
import { RenderedBlock } from './RenderedBlock'

interface RenderedRegionProps {
  region: RegionName
  nodes: RenderedNode[]
}

// ── Region layout hints ───────────────────────────────────────
const REGION_CLASS: Record<RegionName, string> = {
  top:       'renderer-region renderer-region--top',
  filters:   'renderer-region renderer-region--filters',
  primary:   'renderer-region renderer-region--primary',
  secondary: 'renderer-region renderer-region--secondary',
  footer:    'renderer-region renderer-region--footer',
}

export function RenderedRegion({ region, nodes }: RenderedRegionProps) {
  if (nodes.length === 0) return null

  // Sort by layout order
  const sorted = [...nodes].sort((a, b) => a.layout.order - b.layout.order)

  return (
    <section
      className={REGION_CLASS[region]}
      data-region={region}
      aria-label={`Page region: ${region}`}
    >
      <div className="renderer-grid">
        {sorted.map(node => (
          <RenderedBlock key={node._blockId} node={node} />
        ))}
      </div>
    </section>
  )
}

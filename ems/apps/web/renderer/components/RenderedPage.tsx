'use client'

// ============================================================
// RenderedPage — top-level renderer component
// Takes a wireframe JSON document, runs the pipeline, renders
// ============================================================

import React from 'react'
import { render } from '../core/RendererEngine'
import { RenderedRegion } from './RenderedRegion'
import { REGION_ORDER } from '../types/wireframe'
import type { RegionName } from '../types/wireframe'
import type { RenderedNode } from '../types/output'

interface RenderedPageProps {
  /** Raw wireframe document (plain JS object matching WireframeDocument) */
  wireframe: unknown
  /** Page-level API data — keyed by block dataKey values */
  data?: Record<string, unknown>
  /** Show validation errors/warnings overlay in development */
  showDebug?: boolean
}

export function RenderedPage({ wireframe, data, showDebug = false }: RenderedPageProps) {
  const result = render(wireframe, data)

  // Failed render — show error state
  if (result.status === 'failed') {
    const isDevMode = process.env.NODE_ENV === 'development'
    if (!isDevMode) return null

    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          padding: 24,
          background: 'var(--b-lt)',
          border: '1px solid var(--b-border)',
          borderRadius: 'var(--radius)',
          color: 'var(--b-dk)',
          fontFamily: 'var(--font)',
        }}
      >
        <strong>Renderer failed</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          {result.errors.map((e, i) => (
            <li key={i}>[{e.code}] {e.message}</li>
          ))}
        </ul>
      </div>
    )
  }

  // Group nodes by region
  const nodesByRegion = new Map<RegionName, RenderedNode[]>()
  for (const node of result.tree) {
    const region = node.layout.region as RegionName
    if (!nodesByRegion.has(region)) nodesByRegion.set(region, [])
    nodesByRegion.get(region)!.push(node)
  }

  return (
    <div
      className="renderer-page"
      data-surface={
        (wireframe as Record<string, unknown>)?.surface ?? 'app'
      }
      data-document-id={result.documentId}
    >
      {/* Render regions in canonical order */}
      {REGION_ORDER.map(region => {
        const nodes = nodesByRegion.get(region as RegionName) ?? []
        return (
          <RenderedRegion
            key={region}
            region={region as RegionName}
            nodes={nodes}
          />
        )
      })}

      {/* Debug overlay — development only */}
      {showDebug && process.env.NODE_ENV === 'development' && (
        <RendererDebugOverlay result={result} />
      )}
    </div>
  )
}

// ── Debug overlay ─────────────────────────────────────────────
function RendererDebugOverlay({ result }: { result: ReturnType<typeof render> }) {
  const errors   = result.errors.filter(e => e.severity === 'error')
  const warnings = result.errors.filter(e => e.severity === 'warning')

  return (
    <aside
      data-renderer-debug
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 340,
        background: 'var(--ink)',
        color: 'var(--off)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 16px',
        fontSize: 11,
        fontFamily: 'monospace',
        zIndex: 9999,
        maxHeight: 320,
        overflowY: 'auto',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        Renderer: {result.documentId} ({result.version})
      </div>
      {errors.length > 0 && (
        <div>
          <span style={{ color: 'var(--b-md)' }}>✗ {errors.length} error(s)</span>
          {errors.map((e, i) => (
            <div key={i} style={{ color: 'var(--b-lt)', marginTop: 2 }}>
              [{e.code}] {e.message}
            </div>
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <span style={{ color: 'var(--a-md)' }}>⚠ {warnings.length} warning(s)</span>
          {warnings.map((w, i) => (
            <div key={i} style={{ color: 'var(--a-lt)', marginTop: 2 }}>
              {w.message}
            </div>
          ))}
        </div>
      )}
      {result.resolutionLog.length > 0 && (
        <div style={{ marginTop: 8, color: 'var(--ink-3)' }}>
          {result.resolutionLog.length} conflict(s) resolved
        </div>
      )}
    </aside>
  )
}

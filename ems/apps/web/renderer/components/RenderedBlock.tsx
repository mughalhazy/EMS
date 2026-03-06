'use client'

// ============================================================
// RenderedBlock — renders a single RenderedNode to React
// Maps CanonicalComponent → actual React component
// ============================================================

import React from 'react'
import type { RenderedNode } from '../types/output'

// Lazy-import actual components from the UI library
// These resolve to the components built in Phase 2
import dynamic from 'next/dynamic'

// ── Component registry ───────────────────────────────────────
// Maps CanonicalComponent name → lazy-loaded React component
// Falls back to UnknownBlock for anything not in registry
const COMPONENT_REGISTRY: Record<string, React.ComponentType<Record<string, unknown>>> = {}

// Populated lazily to avoid circular imports at module init
function getComponent(name: string): React.ComponentType<Record<string, unknown>> {
  // Return a placeholder that renders the component name in development
  // In production wiring, replace with actual component imports
  return function RendererPlaceholder(props: Record<string, unknown>) {
    const isDevMode = process.env.NODE_ENV === 'development'
    if (!isDevMode) return null

    return (
      <div
        data-renderer-component={name}
        data-renderer-block={props['data-block-id'] as string}
        style={{
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius)',
          padding: '8px 12px',
          fontSize: '12px',
          color: 'var(--ink-3)',
          background: 'var(--surface)',
          fontFamily: 'var(--font)',
        }}
      >
        <strong>{name}</strong>
        {props.children ? (
          <div>{props.children as React.ReactNode}</div>
        ) : null}
      </div>
    )
  }
}

// ── Props ────────────────────────────────────────────────────
interface RenderedBlockProps {
  node: RenderedNode
  depth?: number
}

// ── Span → CSS class map (12-col grid) ───────────────────────
function spanClass(span: number): string {
  return `col-span-${Math.min(Math.max(span, 1), 12)}`
}

// ── Main component ────────────────────────────────────────────
export function RenderedBlock({ node, depth = 0 }: RenderedBlockProps) {
  const Component = COMPONENT_REGISTRY[node.component] ?? getComponent(node.component)

  const { a11y, props, styleTokens, state, layout, children, _blockId } = node

  // Build aria attrs
  const ariaAttrs: Record<string, unknown> = {}
  if (a11y.role)             ariaAttrs.role             = a11y.role
  if (a11y['aria-label'])    ariaAttrs['aria-label']    = a11y['aria-label']
  if (a11y['aria-describedby']) ariaAttrs['aria-describedby'] = a11y['aria-describedby']
  if (a11y['aria-live'])     ariaAttrs['aria-live']     = a11y['aria-live']

  // Combine: catalog props + aria + state + data attrs
  const combinedProps: Record<string, unknown> = {
    ...props,
    ...ariaAttrs,
    'data-state': state,
    'data-block-id': _blockId,
    'data-tokens': styleTokens.join(' '),
  }

  return (
    <div
      className={spanClass(layout.span)}
      data-region={layout.region}
      data-order={layout.order}
      style={{ order: layout.order }}
    >
      <Component {...combinedProps}>
        {children.length > 0
          ? children.map(child => (
              <RenderedBlock key={child._blockId} node={child} depth={depth + 1} />
            ))
          : null}
      </Component>
    </div>
  )
}
